use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct PublicServerConfig {
    #[serde(default = "default_port")]
    pub port: u16,
}

impl Default for PublicServerConfig {
    fn default() -> Self {
        Self {
            port: default_port(),
        }
    }
}

fn default_port() -> u16 {
    5252
}
