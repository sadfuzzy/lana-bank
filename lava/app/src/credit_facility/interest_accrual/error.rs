use thiserror::Error;

#[derive(Error, Debug)]
pub enum InterestAccrualError {
    #[error("InterestAccrualError - Sqlx: {0}")]
    Sqlx(#[from] sqlx::Error),
    #[error("InterestAccrualError - JobError: {0}")]
    JobError(#[from] crate::job::error::JobError),
    #[error("InterestAccrualError - AlreadyAccrued")]
    AlreadyAccrued,
    #[error("InterestAccrualError - InterestPeriodStartDatePastAccrualDate")]
    InterestPeriodStartDatePastAccrualDate,
    #[error("InterestAccrualError - NotFound")]
    NotFound,
}

es_entity::from_es_entity_error!(InterestAccrualError);
