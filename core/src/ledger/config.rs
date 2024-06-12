use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct LedgerConfig {
    #[serde(default = "default_cala_url")]
    pub(super) cala_url: String,
    #[serde(default)]
    pub(crate) bfx_key: String,
    #[serde(default)]
    pub(crate) bfx_secret: String,
}

impl Default for LedgerConfig {
    fn default() -> Self {
        LedgerConfig {
            cala_url: default_cala_url(),
            bfx_key: "".to_string(),
            bfx_secret: "".to_string(),
        }
    }
}

fn default_cala_url() -> String {
    "http://localhost:2252/graphql".to_string()
}
