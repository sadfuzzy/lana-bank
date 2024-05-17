use thiserror::Error;

#[derive(Error, Debug)]
pub enum CalaError {
    #[error("CalaError - Reqwest: {0}")]
    Reqwest(#[from] reqwest::Error),
}
