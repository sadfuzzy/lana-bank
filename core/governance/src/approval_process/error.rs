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

es_entity::from_es_entity_error!(ApprovalProcessError);
