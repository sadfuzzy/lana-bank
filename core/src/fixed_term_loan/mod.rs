mod entity;
pub mod error;
mod job;
mod repo;

use sqlx::PgPool;

use crate::{
    entity::EntityUpdate,
    job::{JobRegistry, Jobs},
    ledger::Ledger,
    primitives::*,
};

pub use entity::*;
use error::*;
use job::*;
use repo::*;

#[derive(Clone)]
pub struct FixedTermLoans {
    repo: FixedTermLoanRepo,
    _ledger: Ledger,
    jobs: Option<Jobs>,
    pool: PgPool,
}

impl FixedTermLoans {
    pub fn new(pool: &PgPool, registry: &mut JobRegistry, ledger: Ledger) -> Self {
        let repo = FixedTermLoanRepo::new(&pool);
        registry.add_initializer(FixedTermLoanJobInitializer::new(&ledger, repo.clone()));
        Self {
            repo,
            _ledger: ledger,
            jobs: None,
            pool: pool.clone(),
        }
    }

    pub fn set_jobs(&mut self, jobs: &Jobs) {
        self.jobs = Some(jobs.clone());
    }

    fn jobs(&self) -> &Jobs {
        self.jobs.as_ref().expect("Jobs not set")
    }

    pub async fn create_loan(&self) -> Result<FixedTermLoan, FixedTermLoanError> {
        let loan_id = FixedTermLoanId::new();
        let new_loan = NewFixedTermLoan::builder()
            .id(loan_id)
            .build()
            .expect("Could not build FixedTermLoan");
        let mut tx = self.pool.begin().await?;
        let EntityUpdate { entity: loan, .. } = self.repo.create_in_tx(&mut tx, new_loan).await?;
        self.jobs()
            .create_and_spawn_job::<FixedTermLoanJobInitializer, _>(
                loan.id,
                format!("fixed_term_loan:{}", loan.id),
                FixedTermLoanJobConfig {},
            )
            .await?;
        Ok(loan)
    }

    pub async fn find_by_id(
        &self,
        id: FixedTermLoanId,
    ) -> Result<FixedTermLoan, FixedTermLoanError> {
        self.repo.find_by_id(id).await
    }
}
