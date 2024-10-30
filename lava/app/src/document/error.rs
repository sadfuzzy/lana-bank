use thiserror::Error;

#[derive(Error, Debug)]
pub enum DocumentError {
    #[error("DocumentError - Sqlx: {0}")]
    Sqlx(#[from] sqlx::Error),
    #[error("DocumentError - AuthorizationError: {0}")]
    AuthorizationError(#[from] crate::authorization::error::AuthorizationError),
    #[error("DocumentError - StorageError: {0}")]
    StorageError(#[from] crate::storage::StorageError),
    #[error("DocumentError - NotFound")]
    NotFound,
}

es_entity::from_es_entity_error!(DocumentError);
