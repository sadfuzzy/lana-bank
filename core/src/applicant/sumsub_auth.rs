use anyhow::Result;
use hmac::{Hmac, Mac};
use reqwest::header::{HeaderMap, HeaderValue};
use reqwest::Client;
use serde::Deserialize;
use serde_json::json;
use sha2::Sha256;
use std::time::{SystemTime, UNIX_EPOCH};

use crate::primitives::CustomerId;

use super::SumsubConfig;

const SUMSUB_BASE_URL: &str = "https://api.sumsub.com";

#[derive(Clone, Debug)]
pub struct SumsubClient {
    pub sumsub_key: String,
    pub sumsub_secret: String,
}

#[derive(Deserialize, Debug)]
pub struct CreateAccessTokenResponse {
    pub token: String,
    #[serde(rename = "userId")]
    pub user_id: String,
}

#[derive(Deserialize, Debug)]
pub struct CreatePermalinkResponse {
    pub url: String,
}

impl SumsubClient {
    pub fn new(config: &SumsubConfig) -> Self {
        Self {
            sumsub_key: config.sumsub_key.clone(),
            sumsub_secret: config.sumsub_secret.clone(),
        }
    }

    pub async fn create_access_token(
        &self,
        client: &Client,
        external_user_id: CustomerId,
        level_name: &str,
    ) -> Result<CreateAccessTokenResponse, anyhow::Error> {
        let method = "POST";
        let url = format!(
            "/resources/accessTokens?levelName={}&userId={}",
            level_name, external_user_id
        );
        let full_url = format!("{}{}", SUMSUB_BASE_URL, &url);

        let body = json!({}).to_string();

        let timestamp = SystemTime::now().duration_since(UNIX_EPOCH)?.as_secs();
        let signature = self.sign(method, &url, Some(&body), timestamp)?;

        let mut headers = HeaderMap::new();
        headers.insert("Accept", HeaderValue::from_static("application/json"));
        headers.insert("Content-Type", HeaderValue::from_static("application/json"));
        headers.insert("X-App-Token", HeaderValue::from_str(&self.sumsub_key)?);
        headers.insert(
            "X-App-Access-Ts",
            HeaderValue::from_str(&timestamp.to_string())?,
        );
        headers.insert("X-App-Access-Sig", HeaderValue::from_str(&signature)?);

        let response = client
            .post(&full_url)
            .headers(headers)
            .body(body)
            .send()
            .await?;

        let response_text = response.text().await?;
        println!("Raw response: {}", response_text);

        let response_json = serde_json::from_str(&response_text)?;
        Ok(response_json)
    }

    pub async fn create_permalink(
        &self,
        client: &Client,
        external_user_id: CustomerId,
        level_name: &str,
    ) -> Result<CreatePermalinkResponse, anyhow::Error> {
        let method = "POST";
        let url =
            format!("/resources/sdkIntegrations/levels/{level_name}/websdkLink?&externalUserId={external_user_id}");
        let full_url = format!("{}{}", SUMSUB_BASE_URL, &url);

        let body = json!({}).to_string();

        let timestamp = SystemTime::now().duration_since(UNIX_EPOCH)?.as_secs();
        let signature = self.sign(method, &url, Some(&body), timestamp)?;

        let mut headers = HeaderMap::new();
        headers.insert("Accept", HeaderValue::from_static("application/json"));
        headers.insert("Content-Type", HeaderValue::from_static("application/json"));
        headers.insert("X-App-Token", HeaderValue::from_str(&self.sumsub_key)?);
        headers.insert(
            "X-App-Access-Ts",
            HeaderValue::from_str(&timestamp.to_string())?,
        );
        headers.insert("X-App-Access-Sig", HeaderValue::from_str(&signature)?);

        let response = client
            .post(&full_url)
            .headers(headers)
            .body(body)
            .send()
            .await?;

        let response_text = response.text().await?;
        println!("Raw response permalink: {}", response_text);

        let response_json = serde_json::from_str(&response_text)?;
        Ok(response_json)
    }

    fn sign(
        &self,
        method: &str,
        url: &str,
        body: Option<&str>,
        timestamp: u64,
    ) -> Result<String, anyhow::Error> {
        type HmacSha256 = Hmac<Sha256>;
        let mut mac = HmacSha256::new_from_slice(self.sumsub_secret.as_bytes())
            .expect("HMAC can take key of any size");
        mac.update(timestamp.to_string().as_bytes());
        mac.update(method.as_bytes());
        mac.update(url.as_bytes());
        if let Some(body) = body {
            mac.update(body.as_bytes());
        }
        Ok(hex::encode(mac.finalize().into_bytes()))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    use std::env;
    use tokio;
    // use uuid::uuid;
    use uuid::Uuid;

    fn load_config_from_env() -> Option<SumsubConfig> {
        let sumsub_key = env::var("SUMSUB_KEY").ok()?;
        let sumsub_secret = env::var("SUMSUB_SECRET").ok()?;
        Some(SumsubConfig {
            sumsub_key,
            sumsub_secret,
        })
    }

    #[tokio::test]
    async fn test_create_signature() {
        let user_config = load_config_from_env();

        if user_config.is_none() {
            println!("not running the test");
            return;
        };

        let v = SumsubClient::new(&user_config.unwrap());

        let method = "POST";
        let url = "/myurl";
        let body = None;
        let timestamp = 10;

        let signature = v
            .sign(method, url, body, timestamp)
            .expect("Signing failed");

        println!("signature {:?}", signature);
    }

    #[tokio::test]
    async fn get_access_token() {
        let user_config = load_config_from_env();

        if user_config.is_none() {
            println!("not running the test");
            return;
        };

        let user_config = user_config.unwrap();
        let v = SumsubClient::new(&user_config);

        // let random_id = uuid!("00000000-0000-0000-0000-000000000001");
        let random_id = Uuid::new_v4();

        let user_id = CustomerId::from(random_id);

        let level = "basic-kyc-level";

        let client = Client::new();
        let res = v.create_access_token(&client, user_id, level).await;

        match res {
            Ok(CreateAccessTokenResponse { token, user_id }) => {
                println!("Success response: token: {token}, user_id: {user_id}");
            }
            Err(e) => {
                println!("Request failed: {:?}", e);
            }
        }
    }

    #[tokio::test]
    async fn create_permalink() {
        let user_config = load_config_from_env();

        if user_config.is_none() {
            println!("not running the test");
            return;
        };

        let user_config = user_config.unwrap();
        let v = SumsubClient::new(&user_config);

        // let random_id = uuid!("00000000-0000-0000-0000-000000000001");
        let random_id = Uuid::new_v4();

        let user_id = CustomerId::from(random_id);

        let level = "basic-kyc-level";

        let client = Client::new();
        let res = v.create_permalink(&client, user_id, level).await;

        match res {
            Ok(CreatePermalinkResponse { url }) => {
                println!("Success response: url: {url}");
            }
            Err(e) => {
                println!("Request failed: {:?}", e);
            }
        }
    }
}
