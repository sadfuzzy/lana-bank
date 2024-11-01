use thiserror::Error;

#[derive(Error, Debug)]
pub enum EsEntityError {
    #[error("EsEntityError - UninitializedFieldError: {0}")]
    UninitializedFieldError(#[from] derive_builder::UninitializedFieldError),
    #[error("EsEntityError - Deserialization: {0}")]
    EventDeserialization(#[from] serde_json::Error),
    #[error("EntityError - NotFound")]
    NotFound,
    #[error("EntityError - ConcurrentModification")]
    ConcurrentModification,
}

#[derive(Error, Debug)]
pub enum EsRepoError {
    #[error("EsRepoError - Sqlx: {0}")]
    Sqlx(#[from] sqlx::Error),
    #[error("{0}")]
    EntityError(#[from] EsEntityError),
}
