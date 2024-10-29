use thiserror::Error;

#[derive(Error, Debug)]
pub enum UserError {
    #[error("UserError - Sqlx: {0}")]
    Sqlx(#[from] sqlx::Error),
    #[error("UserError - NotFound")]
    NotFound,
    #[error("UserError - AuthorizationError: {0}")]
    AuthorizationError(#[from] authz::error::AuthorizationError),
    #[error("UserError - AuditError: {0}")]
    AuditError(#[from] audit::error::AuditError),
    #[error("SubjectError - SubjectIsNotUser")]
    SubjectIsNotUser,
}

impl From<es_entity::EsEntityError> for UserError {
    fn from(e: es_entity::EsEntityError) -> Self {
        match e {
            es_entity::EsEntityError::NotFound => UserError::NotFound,
            es_entity::EsEntityError::UninitializedFieldError(e) => {
                panic!("Inconsistent data when initializing a User entity: {:?}", e)
            }
        }
    }
}
