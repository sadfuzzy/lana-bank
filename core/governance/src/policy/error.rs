use thiserror::Error;

#[derive(Error, Debug)]
pub enum PolicyError {
    #[error("PolicyError - Sqlx: {0}")]
    Sqlx(#[from] sqlx::Error),
    #[error("PolicyError - NotFound")]
    NotFound,
}

impl From<es_entity::EsEntityError> for PolicyError {
    fn from(e: es_entity::EsEntityError) -> Self {
        match e {
            es_entity::EsEntityError::NotFound => PolicyError::NotFound,
            es_entity::EsEntityError::UninitializedFieldError(e) => {
                panic!(
                    "Inconsistent data when initializing a Policy entity: {:?}",
                    e
                )
            }
        }
    }
}
