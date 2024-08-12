use serde::{Deserialize, Serialize};

use super::Deposit;

#[derive(Debug, Serialize, Deserialize)]
pub struct DepositCursor {
    pub deposit_created_at: chrono::DateTime<chrono::Utc>,
}

impl From<Deposit> for DepositCursor {
    fn from(deposit: Deposit) -> Self {
        Self {
            deposit_created_at: deposit.created_at(),
        }
    }
}
