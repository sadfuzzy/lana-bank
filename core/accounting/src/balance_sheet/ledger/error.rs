use thiserror::Error;

#[derive(Error, Debug)]
pub enum BalanceSheetLedgerError {
    #[error("BalanceSheetLedgerError - Sqlx: {0}")]
    Sqlx(#[from] sqlx::Error),
    #[error("BalanceSheetLedgerError - CalaLedger: {0}")]
    CalaLedger(#[from] cala_ledger::error::LedgerError),
    #[error("BalanceSheetLedgerError - CalaAccountSet: {0}")]
    CalaAccountSet(#[from] cala_ledger::account_set::error::AccountSetError),
    #[error("BalanceSheetLedgerError - CalaBalance: {0}")]
    CalaBalance(#[from] cala_ledger::balance::error::BalanceError),
    #[error("BalanceSheetLedgerError - NonAccountSetMemberTypeFound")]
    NonAccountSetMemberTypeFound,
    #[error("BalanceSheetLedgerError - NotFound: {0}")]
    NotFound(String),
}

impl BalanceSheetLedgerError {
    pub fn account_set_exists(&self) -> bool {
        matches!(
            self,
            Self::CalaAccountSet(
                cala_ledger::account_set::error::AccountSetError::ExternalIdAlreadyExists,
            )
        )
    }
}
