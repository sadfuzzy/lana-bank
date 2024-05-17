pub mod error;

use crate::primitives::LedgerAccountId;

use error::*;

#[derive(Clone)]
pub struct Ledger {}

impl Ledger {
    pub fn new() -> Self {
        Ledger {}
    }

    pub async fn create_account_for_loan(
        &self,
        id: impl Into<LedgerAccountId>,
    ) -> Result<LedgerAccountId, LedgerError> {
        Ok(id.into())
    }
}
