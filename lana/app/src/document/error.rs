use thiserror::Error;

#[derive(Error, Debug)]
pub enum DocumentError {
    #[error("DocumentError - Sqlx: {0}")]
    Sqlx(#[from] sqlx::Error),
    #[error("DocumentError - EsEntityError: {0}")]
    EsEntityError(es_entity::EsEntityError),
    #[error("DocumentError - CursorDestructureError: {0}")]
    CursorDestructureError(#[from] es_entity::CursorDestructureError),
    #[error("DocumentError - AuthorizationError: {0}")]
    AuthorizationError(#[from] crate::authorization::error::AuthorizationError),
    #[error("DocumentError - StorageError: {0}")]
    StorageError(#[from] crate::storage::StorageError),
}

es_entity::from_es_entity_error!(DocumentError);
