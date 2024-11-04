use thiserror::Error;

use crate::primitives::{UsdCents, WithdrawalId};

#[derive(Error, Debug)]
pub enum WithdrawalError {
    #[error("WithdrawalError - Sqlx: {0}")]
    Sqlx(#[from] sqlx::Error),
    #[error("WithdrawalError - EsEntityError: {0}")]
    EsEntityError(es_entity::EsEntityError),
    #[error("WithdrawalError - LedgerError: {0}")]
    LedgerError(#[from] crate::ledger::error::LedgerError),
    #[error("WithdrawalError - GovernanceError: {0}")]
    GovernanceError(#[from] governance::error::GovernanceError),
    #[error("WithdrawalError - UserError: {0}")]
    CustomerError(#[from] crate::customer::error::CustomerError),
    #[error("WithdrawalError - NotApproved: {0}")]
    NotApproved(WithdrawalId),
    #[error("WithdrawalError - AlreadyConfirmed: {0}")]
    AlreadyConfirmed(WithdrawalId),
    #[error("WithdrawalError - AlreadyCancelled: {0}")]
    AlreadyCancelled(WithdrawalId),
    #[error("WithdrawalError - AuthorizationError: {0}")]
    AuthorizationError(#[from] crate::authorization::error::AuthorizationError),
    #[error("WithdrawalError - InsufficientBalance: {0} < {1}")]
    InsufficientBalance(UsdCents, UsdCents),
    #[error("WithdrawalError - AuditError: {0}")]
    AuditError(#[from] audit::error::AuditError),
    #[error("WithdrawalError - JobError: {0}")]
    JobError(#[from] crate::job::error::JobError),
}

es_entity::from_es_entity_error!(WithdrawalError);
