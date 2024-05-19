mod cala;
mod config;
mod constants;
pub mod error;

use crate::primitives::LedgerAccountId;

use cala::*;
pub use config::*;
use error::*;

#[derive(Clone)]
pub struct Ledger {
    pub cala: CalaClient,
}

impl Ledger {
    pub async fn init(config: LedgerConfig) -> Result<Self, LedgerError> {
        let cala = CalaClient::new(config.cala_url);
        Self::initialize_global_accounts(&cala).await?;
        Ok(Ledger { cala })
    }

    pub async fn create_account_for_loan(
        &self,
        id: impl Into<LedgerAccountId>,
    ) -> Result<LedgerAccountId, LedgerError> {
        Ok(id.into())
    }

    async fn initialize_global_accounts(cala: &CalaClient) -> Result<(), LedgerError> {
        Self::assert_account_exists(
            cala,
            constants::LOAN_OMINBUS_EXTERNAL_ID,
            constants::LOAN_OMINBUS_EXTERNAL_ID,
            constants::LOAN_OMINBUS_EXTERNAL_ID,
        )
        .await?;
        Ok(())
    }

    async fn assert_account_exists(
        cala: &CalaClient,
        name: &str,
        code: &str,
        external_id: &str,
    ) -> Result<LedgerAccountId, LedgerError> {
        if let Ok(id) = cala
            .find_account_by_external_id(external_id.to_owned())
            .await
        {
            return Ok(id);
        }

        let err = match cala
            .create_account(name.to_owned(), code.to_owned(), external_id.to_owned())
            .await
        {
            Ok(id) => return Ok(id),
            Err(e) => e,
        };

        Ok(cala
            .find_account_by_external_id(external_id.to_owned())
            .await
            .map_err(|_| err)?)
    }
}
