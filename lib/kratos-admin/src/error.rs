use ory_kratos_client::apis::identity_api::{CreateIdentityError, PatchIdentityError};
use thiserror::Error;

#[derive(Error, Debug)]
pub enum KratosAdminError {
    #[error("KratosAdminError - OryKratosAdminApiCreateIdentityError: {0}")]
    KratosAdminApiCreateIdentityError(#[from] ory_kratos_client::apis::Error<CreateIdentityError>),
    #[error("KratosAdminError - OryKratosAdminApiPatchIdentityError: {0}")]
    KratosAdminApiPatchIdentityError(#[from] ory_kratos_client::apis::Error<PatchIdentityError>),
    #[error("KratosAdminError - UuidError: {0}")]
    Uuid(#[from] ::uuid::Error),
}
