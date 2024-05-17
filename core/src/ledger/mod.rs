mod cala;
mod config;
pub mod error;

use crate::primitives::LedgerAccountId;

use cala::*;
pub use config::*;
use error::*;

#[derive(Clone)]
pub struct Ledger {
    cala: CalaClient,
}

impl Ledger {
    pub async fn init(config: LedgerConfig) -> Result<Self, LedgerError> {
        Ok(Ledger {
            cala: CalaClient::new(config.cala_url),
        })
    }

    pub async fn create_account_for_loan(
        &self,
        id: impl Into<LedgerAccountId>,
    ) -> Result<LedgerAccountId, LedgerError> {
        // ACTUALLY CALL CALA
        // SEE galoy client in stablesats for inspiration of the code structure
        Ok(id.into())
    }
}
