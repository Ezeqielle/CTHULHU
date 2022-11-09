use aes::{
    cipher::{NewCipher, StreamCipher},
    Aes256Ctr,
};
use std::{
    env,
    process::exit,
    fmt::Error as FmtError,
    fs::{read_dir, remove_file, File, OpenOptions},
    io::{BufReader, Read, Write},
};
use std::{path::Path, thread::{self, JoinHandle}};

fn aes_256_ctr_encrypt_decrypt(ctext: &mut [u8], key: &[u8], nonce: &[u8]) -> Result<(), FmtError> {
    if key.len() != 32 {
        return Err(FmtError);
    }

    let mut cipher = Aes256Ctr::new(key.into(), (nonce).into());

    cipher.apply_keystream(ctext);

    Ok(())
}

fn inc_counter(nonce: &mut [u8]) {
    let mut index: usize = 0;
    loop {
        if nonce[index] < 255 {
            nonce[index] += 1;
            break;
        } else {
            if index + 1 != nonce.len() {
                index += 1;
            } else {
                for elem in nonce.iter_mut() {
                    *elem = 0;
                }
                index = 0;
            }
        }
    }
}

fn get_dst_file_path(file_path: &str) -> String {
    let encoded_ext = "enc";
    let file_path_struct = Path::new(file_path);
    match file_path_struct.extension() {
        Some(ext) => {
            if ext == encoded_ext {
                return String::from(file_path_struct.with_extension("").to_str().unwrap());
            }
        }
        None => (),
    }
    let mut file_path_dst = String::from(file_path);
    file_path_dst.push('.');
    file_path_dst.push_str(encoded_ext);
    file_path_dst
}

#[derive(Debug)]
enum FileEncryptionDecryptionError {
    ErrorSrcFile(String),
    ErrorDstFile(String),
}

fn encrypt_decrypt_file(
    file_src_path: &str,
    key: &'static [u8],
) -> Result<u64, FileEncryptionDecryptionError> {
    //Open Source file
    let file_src = match File::open(file_src_path) {
        Ok(file) => file,
        Err(_) => {
            return Err(FileEncryptionDecryptionError::ErrorSrcFile(String::from(
                "Could not open source file",
            )))
        }
    };

    //Modify destination file extension depending on decryption or encryption
    let file_dst_path = get_dst_file_path(file_src_path);

    let mut file_dst = match OpenOptions::new()
        .create_new(true)
        .write(true)
        .append(true)
        .open(file_dst_path)
    {
        Ok(file) => file,
        Err(_) => {
            return Err(FileEncryptionDecryptionError::ErrorDstFile(String::from(
                "Could not open destination file",
            )))
        }
    };

    //Get Source file file metadata, to then get total size of the file
    let file_read_meta = match file_src.metadata() {
        Ok(data) => data,
        Err(_) => {
            return Err(FileEncryptionDecryptionError::ErrorSrcFile(String::from(
                "Could not get metadata for source file",
            )))
        }
    };

    //let file_dst_path= get_dst_file_path(file_src_path);
    let mut buf_reader = BufReader::new(&file_src);
    let mut total_read_bytes: u64 = 0;
    let mut counter = [0u8; 16];
    // around 305 MB for max size
    let buffer_size: usize = if file_read_meta.len() < 320000000 {
        usize::try_from(file_read_meta.len()).unwrap()
    } else {
        320000000
    };

    let mut buffer: Vec<u8> = vec![0; buffer_size];

    loop {
        let bytes_read = match buf_reader.read(&mut buffer[..]) {
            Ok(bytes) => bytes,
            Err(_) => {
                return Err(FileEncryptionDecryptionError::ErrorSrcFile(String::from(
                    "Could not read bytes from source file",
                )))
            }
        };

        total_read_bytes += u64::try_from(bytes_read).unwrap();
        aes_256_ctr_encrypt_decrypt(&mut buffer[..bytes_read], key, &counter).unwrap();

        file_dst.write_all(&buffer[..bytes_read]).unwrap();

        if total_read_bytes == file_read_meta.len() {
            break;
        }
        inc_counter(&mut counter);
    }

    drop(file_dst);
    drop(file_src);

    remove_file(file_src_path).unwrap();

    return Ok(total_read_bytes);
}

fn main(){
    let args: Vec<String> = env::args().collect();
    if args.len() < 2 {
        println!("Missing Arguments");
        exit(-1)
    }
    let mut threads: Vec<JoinHandle<()>> = Vec::new();

    for file in read_dir(&args[1][..]).unwrap() {
        let thread_handle = thread::spawn(move || {
            let file_path = file.unwrap().path();
            encrypt_decrypt_file(
                file_path.as_os_str().to_str().unwrap(),
                "J&6#TY5d7deGeB#zd8M3pjoiTb$3oo@G".as_bytes(),
            )
            .unwrap();
        });
        threads.push(thread_handle);
    }

    for t in threads {
        t.join().unwrap();
    }
    //encrypt_decrypt_file("1080P_4000K_391399961.mp4.enc", "J&6#TY5d7deGeB#zd8M3pjoiTb$3oo@G".as_bytes()).unwrap();
}
