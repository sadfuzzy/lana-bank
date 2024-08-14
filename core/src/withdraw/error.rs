use thiserror::Error;

use crate::primitives::{UsdCents, WithdrawId};

#[derive(Error, Debug)]
pub enum WithdrawError {
    #[error("WithdrawError - Sqlx: {0}")]
    Sqlx(#[from] sqlx::Error),
    #[error("WithdrawError - EntityError: {0}")]
    EntityError(#[from] crate::entity::EntityError),
    #[error("WithdrawError - LedgerError: {0}")]
    LedgerError(#[from] crate::ledger::error::LedgerError),
    #[error("WithdrawError - UserError: {0}")]
    CustomerError(#[from] crate::customer::error::CustomerError),
    #[error("WithdrawError - CouldNotFindById: {0}")]
    CouldNotFindById(WithdrawId),
    #[error("WithdrawError - AlreadyConfirmed: {0}")]
    AlreadyConfirmed(WithdrawId),
    #[error("WithdrawError - AuthorizationError: {0}")]
    AuthorizationError(#[from] crate::authorization::error::AuthorizationError),
    #[error("WithdrawError - InsufficientBalance: {0} < {1}")]
    InsufficientBalance(UsdCents, UsdCents),
}
