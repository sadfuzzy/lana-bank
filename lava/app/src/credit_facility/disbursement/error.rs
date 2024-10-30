use thiserror::Error;

#[derive(Error, Debug)]
pub enum DisbursementError {
    #[error("DisbursementError - Sqlx: {0}")]
    Sqlx(#[from] sqlx::Error),
    #[error("DisbursementError - JobError: {0}")]
    JobError(#[from] crate::job::error::JobError),
    #[error("DisbursementError - UserCannotApproveTwice")]
    UserCannotApproveTwice,
    #[error("DisbursementError - AlreadyApproved")]
    AlreadyApproved,
    #[error("DisbursementError - NotFound")]
    NotFound,
}

es_entity::from_es_entity_error!(DisbursementError);
