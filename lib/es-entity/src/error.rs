use thiserror::Error;

#[derive(Error, Debug)]
pub enum EsEntityError {
    #[error("EsEntityError - Sqlx: {0}")]
    Sqlx(#[from] sqlx::Error),
}
