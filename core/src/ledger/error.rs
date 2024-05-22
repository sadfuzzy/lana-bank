use thiserror::Error;

#[derive(Error, Debug)]
pub enum LedgerError {
    #[error("LedgerError - CalaError: {0}")]
    Cala(#[from] super::cala::error::CalaError),
    #[error("LedgerError - CouldNotAssertAccountExits")]
    CouldNotAssertAccountExits,
    #[error("LedgerError - CouldNotAssertTxTemplateExists")]
    CouldNotAssertTxTemplateExists,
    #[error("LedgerError - CouldNotInitializeJournal")]
    CouldNotInitializeJournal,
    #[error("LedgerError - AccountNotFound")]
    AccountNotFound,
}
