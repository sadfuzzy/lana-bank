mod error;

use sqlx::PgPool;

use crate::fixed_term_loan::FixedTermLoans;

use error::ApplicationError;

#[derive(Clone)]
pub struct LavaApp {
    _pool: PgPool,
    fixed_term_loans: FixedTermLoans,
}

impl LavaApp {
    pub async fn run(
        pool: PgPool,
        // config: AppConfig,
    ) -> Result<Self, ApplicationError> {
        // let jobs = Jobs::new(&pool);
        // let mut job_executor =
        //     JobExecutor::new(&pool, config.job_execution.clone(), registry, &jobs);
        // job_executor.start_poll().await?;
        let fixed_term_loans = FixedTermLoans::new(pool.clone());
        Ok(Self {
            _pool: pool,
            fixed_term_loans,
        })
    }

    pub fn fixed_term_loans(&self) -> &FixedTermLoans {
        &self.fixed_term_loans
    }
}
