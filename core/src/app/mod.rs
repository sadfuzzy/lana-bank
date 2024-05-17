mod config;
mod error;

use sqlx::PgPool;

use crate::{
    fixed_term_loan::FixedTermLoans,
    job::{JobRegistry, Jobs},
    ledger::Ledger,
};

pub use config::*;
use error::ApplicationError;

#[derive(Clone)]
pub struct LavaApp {
    _pool: PgPool,
    _jobs: Jobs,
    fixed_term_loans: FixedTermLoans,
}

impl LavaApp {
    pub async fn run(pool: PgPool, config: AppConfig) -> Result<Self, ApplicationError> {
        let registry = JobRegistry::new();
        let jobs = Jobs::new(&pool, config.job_execution, registry);
        let ledger = Ledger::new();
        let fixed_term_loans = FixedTermLoans::new(&pool, ledger, jobs.clone());
        Ok(Self {
            _pool: pool,
            _jobs: jobs,
            fixed_term_loans,
        })
    }

    pub fn fixed_term_loans(&self) -> &FixedTermLoans {
        &self.fixed_term_loans
    }
}
