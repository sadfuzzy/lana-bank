use thiserror::Error;

#[derive(Error, Debug)]
pub enum FixedTermLoanError {
    #[error("FixedTermLoanError - Sqlx: {0}")]
    Sqlx(#[from] sqlx::Error),
    #[error("FixedTermLoanError - EntityError: {0}")]
    EntityError(#[from] crate::entity::EntityError),
    #[error("FixedTermLoanError - LedgerError: {0}")]
    LedgerError(#[from] crate::ledger::error::LedgerError),
    #[error("FixedTermLoanError - JobError: {0}")]
    JobError(#[from] crate::job::error::JobError),
}
