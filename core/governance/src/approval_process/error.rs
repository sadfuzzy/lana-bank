use thiserror::Error;

#[derive(Error, Debug)]
pub enum ApprovalProcessError {
    #[error("ApprovalProcessError - Sqlx: {0}")]
    Sqlx(#[from] sqlx::Error),
    #[error("ApprovalProcessError - NotFound")]
    NotFound,
    #[error("ApprovalProcessError - AlreadyVoted")]
    AlreadyVoted,
    #[error("ApprovalProcessError - NotEligible")]
    NotEligible,
    #[error("ApprovalProcessError - AlreadyConcluded")]
    AlreadyConcluded,
}

impl From<es_entity::EsEntityError> for ApprovalProcessError {
    fn from(e: es_entity::EsEntityError) -> Self {
        match e {
            es_entity::EsEntityError::NotFound => ApprovalProcessError::NotFound,
            es_entity::EsEntityError::UninitializedFieldError(e) => {
                panic!(
                    "Inconsistent data when initializing a ApprovalProcess entity: {:?}",
                    e
                )
            }
        }
    }
}
