use thiserror::Error;

#[derive(Error, Debug)]
pub enum ApplicationError {
    #[error("ApplicationError - Sqlx: {0}")]
    Sqlx(#[from] sqlx::Error),
    #[error("ApplicationError - JobError: {0}")]
    JobError(#[from] crate::job::error::JobError),
    #[error("ApplicationError - LedgerError: {0}")]
    LedgerError(#[from] crate::ledger::error::LedgerError),
    #[error("ApplicationError - CustomerError: {0}")]
    CustomerError(#[from] crate::customer::error::CustomerError),
    #[error("ApplicationError - UserError: {0}")]
    UserError(#[from] crate::user::error::UserError),
    #[error("ApplicationError - AuthorizationError: {0}")]
    AuthorizationError(#[from] crate::authorization::error::AuthorizationError),
}
