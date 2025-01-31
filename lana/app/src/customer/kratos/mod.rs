mod config;
pub mod error;

use ory_kratos_client::{
    apis::{configuration::Configuration, identity_api},
    models::CreateIdentityBody,
};

pub use config::*;
use error::KratosClientError;

#[derive(Clone)]
pub struct KratosClient {
    _config: Configuration,
}

impl KratosClient {
    pub fn new(config: &KratosConfig) -> Self {
        let mut kratos_config = Configuration::new();
        kratos_config.base_path.clone_from(&config.admin_url);
        Self {
            _config: kratos_config,
        }
    }

    pub async fn _create_identity(&self, email: &str) -> Result<uuid::Uuid, KratosClientError> {
        let identity_body = CreateIdentityBody::new(
            "email".to_string(),
            serde_json::json!({
                "email": email.to_string()
            }),
        );

        identity_api::create_identity(&self._config, Some(&identity_body))
            .await
            .map_err(KratosClientError::CouldNotCreateIdentity)
            .and_then(|identity| {
                uuid::Uuid::parse_str(&identity.id).map_err(KratosClientError::ParseUuidError)
            })
    }
}
