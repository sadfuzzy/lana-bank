mod entity;
pub mod error;
mod repo;

use sqlx::PgPool;

use crate::{entity::EntityUpdate, primitives::*};

pub use entity::*;
use error::*;
use repo::*;

#[derive(Clone)]
pub struct FixedTermLoans {
    repo: FixedTermLoanRepo,
    pool: PgPool,
}

impl FixedTermLoans {
    pub fn new(pool: PgPool) -> Self {
        Self {
            repo: FixedTermLoanRepo::new(&pool),
            pool,
        }
    }

    pub async fn create_loan(&self) -> Result<FixedTermLoan, FixedTermLoanError> {
        let new_loan = NewFixedTermLoan::builder()
            .id(FixedTermLoanId::new())
            .ledger_account_id(LedgerAccountId::new())
            .build()
            .expect("Could not build FixedTermLoan");
        let mut tx = self.pool.begin().await?;
        let EntityUpdate { entity: loan, .. } = self.repo.create_in_tx(&mut tx, new_loan).await?;
        Ok(loan)
    }

    pub async fn find_by_id(
        &self,
        id: FixedTermLoanId,
    ) -> Result<FixedTermLoan, FixedTermLoanError> {
        self.repo.find_by_id(id).await
    }
}
