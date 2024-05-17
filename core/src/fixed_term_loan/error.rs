use thiserror::Error;

#[derive(Error, Debug)]
pub enum FixedTermLoanError {
    #[error("ApplicationError - Sqlx: {0}")]
    Sqlx(#[from] sqlx::Error),
}
