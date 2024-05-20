mod cala;
mod config;
mod constants;
pub mod error;

use crate::primitives::{LedgerAccountId, Money};

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

    pub async fn create_accounts_for_loan(
        &self,
        id: impl Into<LedgerAccountId>,
    ) -> Result<LedgerAccountId, LedgerError> {
        let id = id.into();
        Self::assert_account_exists(
            &self.cala,
            &format!("lava:loan-{}", id),
            &format!("lava:loan-{}", id),
            &format!("lava:loan-{}", id),
        )
        .await
    }

    pub async fn fetch_account_balance(
        &self,
        id: impl Into<LedgerAccountId>,
    ) -> Result<Money, LedgerError> {
        unimplemented!()
        // let id = id.into();
        // let variables = account_balance::Variables {
        //     account_id: id.into(),
        // };
        // let response = CalaClient::traced_gql_request::<AccountBalance, _>(
        //     &self.cala.client,
        //     &self.cala.url,
        //     variables,
        // )
        // .await?;
        // response
        //     .data
        //     .map(|d| d.account_balance.balance)
        //     .ok_or(LedgerError::MissingDataField)
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
        if let Ok(Some(id)) = cala
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

        cala.find_account_by_external_id(external_id.to_owned())
            .await
            .map_err(|_| err)?
            .ok_or_else(|| LedgerError::CouldNotAssertAccountExits)
    }
}
