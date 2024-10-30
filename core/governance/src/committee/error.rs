use thiserror::Error;

#[derive(Error, Debug)]
pub enum CommitteeError {
    #[error("CommitteeError - Sqlx: {0}")]
    Sqlx(#[from] sqlx::Error),
    #[error("CommitteeError - NotFound")]
    NotFound,
    #[error("CommitteeError - UserAlreadyAdded: {0}")]
    UserAlreadyAdded(crate::primitives::UserId),
}

es_entity::from_es_entity_error!(CommitteeError);
