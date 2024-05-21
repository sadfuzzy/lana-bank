mod config;
mod error;

use sqlx::PgPool;

use crate::{
    fixed_term_loan::FixedTermLoans,
    job::{JobRegistry, Jobs},
    ledger::Ledger,
    line_of_credit::LineOfCreditContracts,
    user::Users,
};

pub use config::*;
use error::ApplicationError;

#[derive(Clone)]
pub struct LavaApp {
    _pool: PgPool,
    _jobs: Jobs,
    fixed_term_loans: FixedTermLoans,
    line_of_credit_contracts: LineOfCreditContracts,
    users: Users,
    ledger: Ledger,
}

impl LavaApp {
    pub async fn run(pool: PgPool, config: AppConfig) -> Result<Self, ApplicationError> {
        let mut registry = JobRegistry::new();
        let ledger = Ledger::init(config.ledger).await?;
        let users = Users::new(&pool, &ledger);
        let mut fixed_term_loans = FixedTermLoans::new(&pool, &mut registry, &ledger);
        let mut line_of_credit_contracts =
            LineOfCreditContracts::new(&pool, &mut registry, &ledger);
        let mut jobs = Jobs::new(&pool, config.job_execution, registry);
        fixed_term_loans.set_jobs(&jobs);
        line_of_credit_contracts.set_jobs(&jobs);
        jobs.start_poll().await?;
        Ok(Self {
            _pool: pool,
            _jobs: jobs,
            users,
            fixed_term_loans,
            line_of_credit_contracts,
            ledger,
        })
    }

    pub fn fixed_term_loans(&self) -> &FixedTermLoans {
        &self.fixed_term_loans
    }

    pub fn line_of_credit_contracts(&self) -> &LineOfCreditContracts {
        &self.line_of_credit_contracts
    }

    pub fn users(&self) -> &Users {
        &self.users
    }

    pub fn ledger(&self) -> &Ledger {
        &self.ledger
    }
}
