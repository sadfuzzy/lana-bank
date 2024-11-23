use thiserror::Error;

use crate::primitives::DepositId;

#[derive(Error, Debug)]
pub enum DepositError {
    #[error("DepositError - Sqlx: {0}")]
    Sqlx(#[from] sqlx::Error),
    #[error("DepositError - EsEntityError: {0}")]
    EsEntityError(es_entity::EsEntityError),
    #[error("DepositError - CursorDestructureError: {0}")]
    CursorDestructureError(#[from] es_entity::CursorDestructureError),
    #[error("DepositError - LedgerError: {0}")]
    LedgerError(#[from] crate::ledger::error::LedgerError),
    #[error("DepositError - UserError: {0}")]
    CustomerError(#[from] crate::customer::error::CustomerError),
    #[error("DepositError - CouldNotFindById: {0}")]
    CouldNotFindById(DepositId),
    #[error("DepositError - AuthorizationError: {0}")]
    AuthorizationError(#[from] crate::authorization::error::AuthorizationError),
    #[error("DepositError - JobError: {0}")]
    JobError(#[from] crate::job::error::JobError),
}

es_entity::from_es_entity_error!(DepositError);
