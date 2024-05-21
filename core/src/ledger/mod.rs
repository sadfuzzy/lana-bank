mod account;
mod cala;
mod config;
mod constants;
pub mod error;

use uuid::Uuid;

use crate::primitives::LedgerAccountId;

pub use account::*;
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
        Self::initialize_journal(&cala).await?;
        Self::initialize_global_accounts(&cala).await?;
        Ok(Ledger { cala })
    }

    pub async fn get_account_by_id(
        &self,
        id: LedgerAccountId,
    ) -> Result<LedgerAccount, LedgerError> {
        self.cala
            .find_account_by_id(id)
            .await?
            .ok_or(LedgerError::AccountNotFound)
    }

    pub async fn create_account_for_user(
        &self,
        bitfinex_username: &str,
    ) -> Result<LedgerAccountId, LedgerError> {
        Self::assert_account_exists(
            &self.cala,
            &format!("USERS.DEPOSIT.{}", bitfinex_username),
            &format!("USERS.DEPOSIT.{}", bitfinex_username),
            &format!("lava:usr:bfx-{}", bitfinex_username),
        )
        .await
    }

    pub async fn create_accounts_for_loan(
        &self,
        id: impl Into<Uuid>,
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

    async fn initialize_journal(cala: &CalaClient) -> Result<(), LedgerError> {
        if cala
            .find_journal_by_id(constants::LAVA_JOURNAL_ID)
            .await
            .is_ok()
        {
            return Ok(());
        }

        let err = match cala.create_lava_journal(constants::LAVA_JOURNAL_ID).await {
            Ok(_) => return Ok(()),
            Err(e) => e,
        };

        cala.find_journal_by_id(constants::LAVA_JOURNAL_ID)
            .await
            .map_err(|_| err)?;
        Ok(())
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
        if let Ok(Some(account)) = cala
            .find_account_by_external_id(external_id.to_owned())
            .await
        {
            return Ok(account.id);
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
            .map(|a| a.id)
    }
}
