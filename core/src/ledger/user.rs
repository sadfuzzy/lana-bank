use crate::primitives::LedgerAccountId;
use serde::{Deserialize, Serialize};

#[derive(Debug, Copy, Clone, Serialize, Deserialize)]
pub struct UserLedgerAccountIds {
    pub unallocated_collateral_id: LedgerAccountId,
    pub checking_id: LedgerAccountId,
}

impl UserLedgerAccountIds {
    #[allow(clippy::new_without_default)]
    pub fn new() -> Self {
        Self {
            unallocated_collateral_id: LedgerAccountId::new(),
            checking_id: LedgerAccountId::new(),
        }
    }
}
