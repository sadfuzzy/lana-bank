use thiserror::Error;

#[derive(Error, Debug)]
pub enum ProcessAssignmentError {
    #[error("ProcessAssignmentError - Sqlx: {0}")]
    Sqlx(#[from] sqlx::Error),
    #[error("ProcessAssignmentError - NotFound")]
    NotFound,
    #[error("ProcessAssignmentError - JobError: {0}")]
    JobError(#[from] crate::job::error::JobError),
}

impl From<es_entity::EsEntityError> for ProcessAssignmentError {
    fn from(e: es_entity::EsEntityError) -> Self {
        match e {
            es_entity::EsEntityError::NotFound => ProcessAssignmentError::NotFound,
            es_entity::EsEntityError::UninitializedFieldError(e) => {
                panic!(
                    "Inconsistent data when initializing a ProcessAssignment entity: {:?}",
                    e
                )
            }
        }
    }
}
