use serde::{Deserialize, Serialize};

use super::Withdraw;

#[derive(Debug, Serialize, Deserialize)]
pub struct WithdrawCursor {
    pub withdrawal_created_at: chrono::DateTime<chrono::Utc>,
}

impl From<Withdraw> for WithdrawCursor {
    fn from(withdraw: Withdraw) -> Self {
        Self {
            withdrawal_created_at: withdraw.created_at(),
        }
    }
}
