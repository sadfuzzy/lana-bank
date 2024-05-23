use crate::primitives::LedgerAccountId;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FixedTermLoanAccountIds {
    pub collateral_account_id: LedgerAccountId,
}

impl FixedTermLoanAccountIds {
    pub fn new() -> Self {
        Self {
            collateral_account_id: LedgerAccountId::new(),
        }
    }
}
