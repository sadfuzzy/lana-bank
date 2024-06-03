use thiserror::Error;

use crate::primitives::*;

#[derive(Error, Debug)]
pub enum FixedTermLoanError {
    #[error("FixedTermLoanError - Sqlx: {0}")]
    Sqlx(#[from] sqlx::Error),
    #[error("FixedTermLoanError - EntityError: {0}")]
    EntityError(#[from] crate::entity::EntityError),
    #[error("FixedTermLoanError - LedgerError: {0}")]
    LedgerError(#[from] crate::ledger::error::LedgerError),
    #[error("FixedTermLoanError - UserError: {0}")]
    UserError(#[from] crate::user::error::UserError),
    #[error("FixedTermLoanError - JobError: {0}")]
    JobError(#[from] crate::job::error::JobError),
    #[error("FixedTermLoanError - AlreadyApproved")]
    AlreadyApproved,
    #[error("FixedTermLoanError - PaymentExceedsOutstandingLoanAmount: {0} > {1}")]
    PaymentExceedsOutstandingLoanAmount(UsdCents, UsdCents),
    #[error("FixedTermLoanError - AlreadyCompleted")]
    AlreadyCompleted,
}
