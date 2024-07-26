use serde::{Deserialize, Serialize};

#[derive(Clone, Default, Debug, Deserialize, Serialize)]
pub struct UserConfig {
    #[serde(default)]
    pub super_user_email: Option<String>,
}
