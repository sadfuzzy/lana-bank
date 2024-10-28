use thiserror::Error;

#[derive(Error, Debug)]
pub enum PolicyError {
    #[error("PolicyError - Sqlx: {0}")]
    Sqlx(sqlx::Error),
    #[error("PolicyError - NotFound")]
    NotFound,
    #[error("PolicyError - DuplicateApprovalProcessType")]
    DuplicateApprovalProcessType,
}

impl From<es_entity::EsEntityError> for PolicyError {
    fn from(e: es_entity::EsEntityError) -> Self {
        match e {
            es_entity::EsEntityError::NotFound => PolicyError::NotFound,
            es_entity::EsEntityError::UninitializedFieldError(e) => {
                panic!(
                    "Inconsistent data when initializing a Policy entity: {:?}",
                    e
                )
            }
        }
    }
}

impl From<sqlx::Error> for PolicyError {
    fn from(error: sqlx::Error) -> Self {
        if let Some(err) = error.as_database_error() {
            if let Some(constraint) = err.constraint() {
                if constraint.contains("type") {
                    return Self::DuplicateApprovalProcessType;
                }
            }
        }
        Self::Sqlx(error)
    }
}
