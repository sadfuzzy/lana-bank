use kratos_admin::KratosAdminConfig;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CustomerOnboardingConfig {
    #[serde(default = "default_auto_create_deposit_account")]
    pub auto_create_deposit_account: bool,
    #[serde(default = "default_customer_status_sync_active")]
    pub customer_status_sync_active: bool,
    #[serde(default = "default_kratos_admin_config")]
    pub kratos_admin: KratosAdminConfig,
}

impl Default for CustomerOnboardingConfig {
    fn default() -> Self {
        Self {
            auto_create_deposit_account: default_auto_create_deposit_account(),
            kratos_admin: default_kratos_admin_config(),
            customer_status_sync_active: default_customer_status_sync_active(),
        }
    }
}

fn default_kratos_admin_config() -> KratosAdminConfig {
    KratosAdminConfig {
        kratos_admin_url: "http://localhost:4436".to_string(),
    }
}

fn default_auto_create_deposit_account() -> bool {
    true
}

fn default_customer_status_sync_active() -> bool {
    true
}
