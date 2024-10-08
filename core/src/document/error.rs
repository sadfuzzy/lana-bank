use thiserror::Error;

#[derive(Error, Debug)]
pub enum DocumentError {
    #[error("DocumentError - Sqlx: {0}")]
    Sqlx(#[from] sqlx::Error),
    #[error("DocumentError - Could not find document by id: {0}")]
    CouldNotFindById(String),
    #[error("DocumentError - EntityError: {0}")]
    EntityError(#[from] crate::entity::EntityError),
    #[error("DocumentError - AuthorizationError: {0}")]
    AuthorizationError(#[from] crate::authorization::error::AuthorizationError),
    #[error("DocumentError - StorageError: {0}")]
    StorageError(#[from] crate::storage::StorageError),
}
