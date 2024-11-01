use thiserror::Error;

use crate::primitives::TermsTemplateId;

#[derive(Error, Debug)]
pub enum TermsTemplateError {
    #[error("TermsTemplateError - Sqlx: {0}")]
    Sqlx(#[from] sqlx::Error),
    #[error("TermsTemplateError - EsEntityError: {0}")]
    EsEntityError(es_entity::EsEntityError),
    #[error("TermsTemplateError - CouldNotFindById: {0}")]
    CouldNotFindById(TermsTemplateId),
    #[error("TermsTemplateError - AuthorizationError: {0}")]
    AuthorizationError(#[from] crate::authorization::error::AuthorizationError),
    #[error("TermsTemplateError - AuditError: {0}")]
    AuditError(#[from] crate::audit::error::AuditError),
    #[error("TermsTemplateError - JobError: {0}")]
    JobError(#[from] crate::job::error::JobError),
}

es_entity::from_es_entity_error!(TermsTemplateError);
