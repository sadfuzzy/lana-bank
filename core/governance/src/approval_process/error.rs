use thiserror::Error;

#[derive(Error, Debug)]
pub enum ApprovalProcessError {
    #[error("ApprovalProcessError - Sqlx: {0}")]
    Sqlx(#[from] sqlx::Error),
    #[error("ApprovalProcessError - EsEntityError: {0}")]
    EsEntityError(es_entity::EsEntityError),
    #[error("ApprovalProcessError - CursorDestructureError: {0}")]
    CursorDestructureError(#[from] es_entity::CursorDestructureError),
}

es_entity::from_es_entity_error!(ApprovalProcessError);
