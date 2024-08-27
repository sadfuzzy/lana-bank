mod config;
mod current;
mod entity;
mod executor;
mod registry;
mod repo;
mod traits;

pub mod error;

use chrono::{DateTime, Utc};
use sqlx::PgPool;
use tracing::instrument;

use crate::primitives::JobId;

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
    _pool: PgPool,
    repo: JobRepo,
    executor: JobExecutor,
}

impl Jobs {
    pub fn new(pool: &PgPool, config: JobExecutorConfig, registry: JobRegistry) -> Self {
        let repo = JobRepo::new(pool);
        let executor = JobExecutor::new(pool, config, registry, &repo);
        Self {
            _pool: pool.clone(),
            repo,
            executor,
        }
    }

    #[instrument(name = "lava.jobs.create_and_spawn_job", skip(self, config))]
    pub async fn create_and_spawn_job<I: JobInitializer, C: serde::Serialize>(
        &self,
        db: &mut sqlx::Transaction<'_, sqlx::Postgres>,
        id: impl Into<JobId> + std::fmt::Debug,
        job_name: String,
        config: C,
    ) -> Result<Job, JobError> {
        let new_job = NewJob::builder()
            .id(id.into())
            .name(job_name)
            .config(config)?
            .job_type(<I as JobInitializer>::job_type())
            .build()
            .expect("Could not build job");
        let job = self.repo.create_in_tx(db, new_job).await?;
        self.executor.spawn_job::<I>(db, &job, None).await?;
        Ok(job)
    }

    #[instrument(name = "lava.jobs.create_and_spawn_job", skip(self, config))]
    pub async fn create_and_spawn_job_at<I: JobInitializer, C: serde::Serialize>(
        &self,
        db: &mut sqlx::Transaction<'_, sqlx::Postgres>,
        id: impl Into<JobId> + std::fmt::Debug,
        name: String,
        config: C,
        schedule_at: DateTime<Utc>,
    ) -> Result<Job, JobError> {
        let new_job = NewJob::builder()
            .id(id.into())
            .name(name)
            .config(config)?
            .job_type(<I as JobInitializer>::job_type())
            .build()
            .expect("Could not build job");
        let job = self.repo.create_in_tx(db, new_job).await?;
        self.executor
            .spawn_job::<I>(db, &job, Some(schedule_at))
            .await?;
        Ok(job)
    }

    pub async fn start_poll(&mut self) -> Result<(), JobError> {
        self.executor.start_poll().await
    }
}
