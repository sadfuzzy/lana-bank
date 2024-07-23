use thiserror::Error;

#[derive(Error, Debug)]
pub enum AuthorizationError {
    #[error("AuthorizationError - CasbinError: {0}")]
    Casbin(#[from] sqlx_adapter::casbin::error::Error),
    #[error("AuthorizationError - NotAuthorized")]
    NotAuthorized,
}
