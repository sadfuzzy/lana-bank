use crate::primitives::LedgerAccountId;
use serde::{Deserialize, Serialize};

#[derive(Debug, Copy, Clone, Serialize, Deserialize)]
pub struct FixedTermLoanAccountIds {
    pub collateral_account_id: LedgerAccountId,
}

impl FixedTermLoanAccountIds {
    #[allow(clippy::new_without_default)]
    pub fn new() -> Self {
        Self {
            collateral_account_id: LedgerAccountId::new(),
        }
    }
}
