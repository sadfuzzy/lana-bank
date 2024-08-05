mod config;
mod error;

use sqlx::PgPool;

use crate::{
    applicant::Applicants,
    authorization::Authorization,
    customer::Customers,
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
    customers: Customers,
    withdraws: Withdraws,
    ledger: Ledger,
    applicants: Applicants,
    users: Users,
}

impl LavaApp {
    pub async fn run(pool: PgPool, config: AppConfig) -> Result<Self, ApplicationError> {
        let authz = Authorization::init(&pool).await?;
        let mut registry = JobRegistry::new();
        let ledger = Ledger::init(config.ledger).await?;
        let customers = Customers::new(&pool, &ledger, &config.customer);
        let applicants = Applicants::new(&pool, &config.sumsub, &customers);
        let withdraws = Withdraws::new(&pool, &customers, &ledger);
        let mut loans = Loans::new(&pool, &mut registry, &customers, &ledger, &authz);
        let mut jobs = Jobs::new(&pool, config.job_execution, registry);
        let users = Users::init(&pool, &authz, config.user).await?;
        loans.set_jobs(&jobs);
        jobs.start_poll().await?;

        Ok(Self {
            _pool: pool,
            _jobs: jobs,
            customers,
            withdraws,
            loans,
            ledger,
            applicants,
            users,
        })
    }

    pub fn customers(&self) -> &Customers {
        &self.customers
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

    pub fn users(&self) -> &Users {
        &self.users
    }
}
