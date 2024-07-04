use thiserror::Error;

#[derive(Error, Debug)]
pub enum ApplicantError {
    #[error("ApplicantError - Sqlx: {0}")]
    Sqlx(#[from] sqlx::Error),
    #[error("ApplicantError - EntityError: {0}")]
    EntityError(#[from] crate::entity::EntityError),
    #[error("ApplicantError - Serde: {0}")]
    Serde(#[from] serde_json::Error),
    #[error("ApplicantError - UserError: {0}")]
    UserError(#[from] crate::user::error::UserError),
}
