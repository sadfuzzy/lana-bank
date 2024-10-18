use thiserror::Error;

#[derive(Error, Debug)]
pub enum EsEntityError {
    #[error("EsEntityError - UninitializedFieldError: {0}")]
    UninitializedFieldError(#[from] derive_builder::UninitializedFieldError),
    #[error("EntityError - NotFound")]
    NotFound,
}

#[derive(Error, Debug)]
pub enum EsRepoError {
    #[error("EsRepoError - Sqlx: {0}")]
    Sqlx(#[from] sqlx::Error),
    #[error("{0}")]
    EntityError(#[from] EsEntityError),
}
