use thiserror::Error;

#[derive(Error, Debug)]
pub enum CommitteeError {
    #[error("CommitteeError - Sqlx: {0}")]
    Sqlx(#[from] sqlx::Error),
    #[error("CommitteeError - NotFound")]
    NotFound,
    #[error("CommitteeError - UserAlreadyAdded: {0}")]
    UserAlreadyAdded(crate::primitives::UserId),
    // #[error("CommitteeError - JobError: {0}")]
    // JobError(#[from] crate::job::error::JobError),
}

impl From<es_entity::EsEntityError> for CommitteeError {
    fn from(e: es_entity::EsEntityError) -> Self {
        match e {
            es_entity::EsEntityError::NotFound => CommitteeError::NotFound,
            es_entity::EsEntityError::UninitializedFieldError(e) => {
                panic!(
                    "Inconsistent data when initializing a Committee entity: {:?}",
                    e
                )
            }
        }
    }
}
