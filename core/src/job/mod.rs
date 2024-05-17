mod config;
mod current;
mod entity;
mod executor;
mod registry;
mod repo;
mod traits;

pub mod error;

use sqlx::PgPool;
use tracing::instrument;

pub use config::*;
pub use current::*;
pub use entity::*;
pub use registry::*;
pub use traits::*;

use error::*;
use executor::*;
use repo::*;

#[derive(Clone)]
pub struct Jobs {
    pool: PgPool,
    repo: JobRepo,
    executor: JobExecutor,
}

impl Jobs {
    pub fn new(pool: &PgPool, config: JobExecutorConfig, registry: JobRegistry) -> Self {
        let repo = JobRepo::new(&pool);
        let executor = JobExecutor::new(&pool, config, registry, &repo);
        Self {
            pool: pool.clone(),
            repo,
            executor,
        }
    }

    #[instrument(name = "lava.jobs.create_and_spawn_job", skip(self, config))]
    pub async fn create_and_spawn_job<I: JobInitializer, C: serde::Serialize>(
        &self,
        name: String,
        description: Option<String>,
        config: C,
    ) -> Result<Job, JobError> {
        let new_job = NewJob::builder()
            .name(name)
            .description(description)
            .config(config)?
            .job_type(<I as JobInitializer>::job_type())
            .build()
            .expect("Could not build job");
        let mut tx = self.pool.begin().await?;
        let job = self.repo.create_in_tx(&mut tx, new_job).await?;
        self.executor.spawn_job::<I>(&mut tx, &job).await?;
        tx.commit().await?;
        Ok(job)
    }
}
