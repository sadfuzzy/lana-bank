mod error;

use sqlx::PgPool;

use error::ApplicationError;

#[derive(Clone)]
pub struct LavaApp {
    _pool: PgPool
}

impl LavaApp {
    pub(crate) async fn run(
        pool: PgPool,
        // config: AppConfig,
    ) -> Result<Self, ApplicationError> {
        // let jobs = Jobs::new(&pool);
        // let mut job_executor =
        //     JobExecutor::new(&pool, config.job_execution.clone(), registry, &jobs);
        // job_executor.start_poll().await?;
        Ok(Self {
            _pool: pool
        })
    }
}
