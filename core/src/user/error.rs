use thiserror::Error;

#[derive(Error, Debug)]
pub enum UserError {
    #[error("FixedTermLoanError - Sqlx: {0}")]
    Sqlx(#[from] sqlx::Error),
    #[error("FixedTermLoanError - EntityError: {0}")]
    EntityError(#[from] crate::entity::EntityError),
}
