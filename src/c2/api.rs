use std::{str::FromStr, collections::HashMap};
use serde_json::{Value, json};
use reqwest::{Client, Response, Error};

pub struct C2API {
    pub base_url: String,
    api_client: Client
}

impl C2API {
    pub fn new() -> Self {
        C2API {
            base_url: String::from_str("http://localhost:5000/api/").unwrap(),
            api_client: reqwest::Client::new()
        }
    }

    async fn format_response(self, response: Result<Response, Error>) -> HashMap<String, Value> {
        match response {
            Ok(res) => {
                let api_res: HashMap<String, Value> = match res.json().await {
                    Ok(res) => {
                        res
                    },
                    Err(error) => {
                        println!("{}", error);
                        HashMap::from([(String::from("data"), json!({})), (String::from("error"), json!({"errorMsg": "Could not Deserialize response !"}))])
                    }
                };
                api_res
            }
            Err(error) => {
                if error.is_status() {
                    println!("{}", error.status().unwrap());
                    return HashMap::from([(String::from("data"), json!({})), (String::from("error"), json!({"errorMsg": "Bad status "}))]);
                }
                return HashMap::from([(String::from("data"), json!({})), (String::from("error"), json!({"errorMsg": "Something went wrong, good luck lol !"}))]);
            }
        }
    }

    pub async fn post(self, json_body: &Value, uri: &str) -> HashMap<String, Value> {
        let api_res = self.api_client.post(self.base_url.clone() + &uri)
            .json(json_body)
            .send()
            .await;

        self.format_response(api_res).await
    }
}