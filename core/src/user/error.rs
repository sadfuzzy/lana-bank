use thiserror::Error;

#[derive(Error, Debug)]
pub enum UserError {
    #[error("UserError - Sqlx: {0}")]
    Sqlx(#[from] sqlx::Error),
    #[error("UserError - EntityError: {0}")]
    EntityError(#[from] crate::entity::EntityError),
    #[error("UserError - LedgerError: {0}")]
    LedgerError(#[from] crate::ledger::error::LedgerError),
}
