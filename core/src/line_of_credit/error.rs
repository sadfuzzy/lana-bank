use thiserror::Error;

#[derive(Error, Debug)]
pub enum LineOfCreditContractError {
    #[error("LineOfCreditContractError - Sqlx: {0}")]
    Sqlx(#[from] sqlx::Error),
    #[error("LineOfCreditContractError - EntityError: {0}")]
    EntityError(#[from] crate::entity::EntityError),
}
