use thiserror::Error;

#[derive(Error, Debug)]
pub enum CommitteeError {
    #[error("CommitteeError - Sqlx: {0}")]
    Sqlx(#[from] sqlx::Error),
    #[error("CommitteeError - EsEntityError: {0}")]
    EsEntityError(es_entity::EsEntityError),
    #[error("CommitteeError - CursorDestructureError: {0}")]
    CursorDestructureError(#[from] es_entity::CursorDestructureError),
    #[error("CommitteeError - MemberAlreadyAdded: {0}")]
    MemberAlreadyAdded(crate::primitives::CommitteeMemberId),
}

es_entity::from_es_entity_error!(CommitteeError);
