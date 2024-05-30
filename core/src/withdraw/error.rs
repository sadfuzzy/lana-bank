use thiserror::Error;

#[derive(Error, Debug)]
pub enum WithdrawError {
    #[error("WithdrawError - Sqlx: {0}")]
    Sqlx(#[from] sqlx::Error),
    #[error("WithdrawError - EntityError: {0}")]
    EntityError(#[from] crate::entity::EntityError),
}
