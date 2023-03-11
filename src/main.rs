mod encryption;

use std::{
    env,
    process::exit,
};

fn main(){
    let args: Vec<String> = env::args().collect();
    if args.len() < 2 {
        println!("Missing Arguments");
        exit(-1)
    }
    encryption::file_encryption::multi_threaded_encrypt_decrypt_files(&args[1][..]);
    
    //encrypt_decrypt_file("1080P_4000K_391399961.mp4.enc", "J&6#TY5d7deGeB#zd8M3pjoiTb$3oo@G".as_bytes()).unwrap();
    exit(0);
}
