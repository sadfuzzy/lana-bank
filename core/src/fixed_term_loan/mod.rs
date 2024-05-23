mod entity;
pub mod error;
// mod job;
mod repo;

use sqlx::PgPool;
use tracing::instrument;

use crate::{
    entity::{EntityError, EntityUpdate},
    job::{JobRegistry, Jobs},
    ledger::Ledger,
    primitives::*,
};

pub use entity::*;
use error::*;
use repo::*;

#[derive(Clone)]
pub struct FixedTermLoans {
    repo: FixedTermLoanRepo,
    _ledger: Ledger,
    jobs: Option<Jobs>,
    pool: PgPool,
}

impl FixedTermLoans {
    pub fn new(pool: &PgPool, _registry: &mut JobRegistry, ledger: &Ledger) -> Self {
        let repo = FixedTermLoanRepo::new(pool);
        Self {
            repo,
            _ledger: ledger.clone(),
            jobs: None,
            pool: pool.clone(),
        }
    }

    pub fn set_jobs(&mut self, jobs: &Jobs) {
        self.jobs = Some(jobs.clone());
    }

    #[instrument(name = "lava.fixed_term_loans.create_loan", skip(self), err)]
    pub async fn create_loan(&self) -> Result<FixedTermLoan, FixedTermLoanError> {
        let loan_id = FixedTermLoanId::new();
        let new_loan = NewFixedTermLoan::builder()
            .id(loan_id)
            .build()
            .expect("Could not build FixedTermLoan");
        let mut tx = self.pool.begin().await?;
        let EntityUpdate { entity: loan, .. } = self.repo.create_in_tx(&mut tx, new_loan).await?;
        tx.commit().await?;
        Ok(loan)
    }

    pub async fn find_by_id(
        &self,
        id: FixedTermLoanId,
    ) -> Result<Option<FixedTermLoan>, FixedTermLoanError> {
        match self.repo.find_by_id(id).await {
            Ok(loan) => Ok(Some(loan)),
            Err(FixedTermLoanError::EntityError(EntityError::NoEntityEventsPresent)) => Ok(None),
            Err(e) => Err(e),
        }
    }
}
