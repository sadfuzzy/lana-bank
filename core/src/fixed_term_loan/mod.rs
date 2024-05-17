mod entity;
pub mod error;
mod repo;

use sqlx::PgPool;

use crate::{entity::EntityUpdate, ledger::Ledger, primitives::*};

pub use entity::*;
use error::*;
use repo::*;

#[derive(Clone)]
pub struct FixedTermLoans {
    repo: FixedTermLoanRepo,
    ledger: Ledger,
    pool: PgPool,
}

impl FixedTermLoans {
    pub fn new(pool: PgPool, ledger: Ledger) -> Self {
        Self {
            repo: FixedTermLoanRepo::new(&pool),
            ledger,
            pool,
        }
    }

    pub async fn create_loan(&self) -> Result<FixedTermLoan, FixedTermLoanError> {
        let loan_id = FixedTermLoanId::new();
        let ledger_account_id = self.ledger.create_account_for_loan(loan_id).await?;
        let new_loan = NewFixedTermLoan::builder()
            .id(loan_id)
            .ledger_account_id(ledger_account_id)
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
