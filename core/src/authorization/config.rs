use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct CasbinConfig {
    #[serde(default = "default_seed_permissions")]
    pub seed_permissions: bool,
}

impl Default for CasbinConfig {
    fn default() -> Self {
        Self {
            seed_permissions: default_seed_permissions(),
        }
    }
}

fn default_seed_permissions() -> bool {
    true
}
