use std::{str::FromStr};
use serde_json::Value;
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

    pub async fn post(self, json_body: &Value, uri: &str) -> Result<Response, Error> {
        /* let api_res =  */self.api_client.post(self.base_url + &uri)
            .json(json_body)
            .send()
            .await
        /* match api_res {
            Ok(res) => {
                res
            },
            Err(error) => {
                error
            }
        } */
    }
}