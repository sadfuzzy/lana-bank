use thiserror::Error;

#[derive(Error, Debug)]
pub enum CreditFacilityHistoryError {
    #[error("CreditFacilityHistoryError - Sqlx: {0}")]
    Sqlx(#[from] sqlx::Error),
}
