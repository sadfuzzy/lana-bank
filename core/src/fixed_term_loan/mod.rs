mod entity;
pub mod error;
mod repo;

use sqlx::PgPool;

pub use entity::*;
use repo::*;

#[derive(Clone)]
pub struct FixedTermLoans {
    repo: FixedTermLoanRepo,
}

impl FixedTermLoans {
    pub fn new(pool: PgPool) -> Self {
        Self {
            repo: FixedTermLoanRepo::new(pool),
        }
    }
}
