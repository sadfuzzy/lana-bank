use thiserror::Error;

use crate::primitives::CustomerId;

#[derive(Error, Debug)]
pub enum CustomerError {
    #[error("UserError - Sqlx: {0}")]
    Sqlx(#[from] sqlx::Error),
    #[error("UserError - EntityError: {0}")]
    EntityError(#[from] crate::entity::EntityError),
    #[error("UserError - LedgerError: {0}")]
    LedgerError(#[from] crate::ledger::error::LedgerError),
    #[error("UserError - CouldNotFindById: {0}")]
    CouldNotFindById(CustomerId),
    #[error("UserError - UnexpectedCurrency")]
    UnexpectedCurrency,
}
