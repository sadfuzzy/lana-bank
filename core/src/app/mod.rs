mod config;
mod error;

use sqlx::PgPool;

use crate::{
    applicant::Applicants,
    job::{JobRegistry, Jobs},
    ledger::Ledger,
    loan::Loans,
    user::Users,
    withdraw::Withdraws,
};

pub use config::*;
use error::ApplicationError;

#[derive(Clone)]
pub struct LavaApp {
    _pool: PgPool,
    _jobs: Jobs,
    loans: Loans,
    users: Users,
    withdraws: Withdraws,
    ledger: Ledger,
    applicants: Applicants,
}

impl LavaApp {
    pub async fn run(pool: PgPool, config: AppConfig) -> Result<Self, ApplicationError> {
        let mut registry = JobRegistry::new();
        let ledger = Ledger::init(config.ledger).await?;
        let users = Users::new(&pool, &ledger);
        let applicants = Applicants::new(&pool, &config.sumsub, &users);
        let withdraws = Withdraws::new(&pool, &users, &ledger);
        let mut loans = Loans::new(&pool, &mut registry, &users, &ledger);
        let mut jobs = Jobs::new(&pool, config.job_execution, registry);
        loans.set_jobs(&jobs);
        jobs.start_poll().await?;
        Ok(Self {
            _pool: pool,
            _jobs: jobs,
            users,
            withdraws,
            loans,
            ledger,
            applicants,
        })
    }

    pub fn users(&self) -> &Users {
        &self.users
    }

    pub fn withdraws(&self) -> &Withdraws {
        &self.withdraws
    }

    pub fn ledger(&self) -> &Ledger {
        &self.ledger
    }

    pub fn applicants(&self) -> &Applicants {
        &self.applicants
    }

    pub fn loans(&self) -> &Loans {
        &self.loans
    }
}
