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

es_entity::from_es_entity_error!(PolicyError);

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
