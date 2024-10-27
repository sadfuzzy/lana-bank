use thiserror::Error;

#[derive(Error, Debug)]
pub enum GovernanceError {
    #[error("GovernanceError - Sqlx: {0}")]
    Sqlx(#[from] sqlx::Error),
    #[error("GovernanceError - AuthorizationError: {0}")]
    AuthorizationError(#[from] lava_authz::error::AuthorizationError),
    #[error("GovernanceError - CommitteeError: {0}")]
    CommitteeError(#[from] super::committee::error::CommitteeError),
    // #[error("GovernanceError - ProcessAssignment: {0}")]
    // ProcessAssignmentError(#[from] super::process_assignment::error::ProcessAssignmentError),
    #[error("GovernanceError - Audit: {0}")]
    AuditError(#[from] lava_audit::error::AuditError),
}
