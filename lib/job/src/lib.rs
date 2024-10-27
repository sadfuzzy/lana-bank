#![cfg_attr(feature = "fail-on-warnings", deny(warnings))]
#![cfg_attr(feature = "fail-on-warnings", deny(clippy::all))]

mod config;
mod current;
mod entity;
mod executor;
mod registry;
mod repo;
mod traits;

pub mod error;

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use tokio::sync::RwLock;
use tracing::instrument;

use std::sync::Arc;

pub use config::*;
pub use current::*;
pub use entity::*;
pub use registry::*;
pub use traits::*;

use error::*;
use executor::*;
use repo::*;

#[derive(Clone, Hash, Debug, Serialize, Deserialize, PartialEq, Eq)]
pub enum JobId {
    Id(uuid::Uuid),
    Unique(JobType),
}

impl JobId {
    #[allow(clippy::new_without_default)]
    pub fn new() -> Self {
        Self::from(uuid::Uuid::new_v4())
    }
}

impl From<uuid::Uuid> for JobId {
    fn from(uuid: uuid::Uuid) -> Self {
        JobId::Id(uuid)
    }
}

impl From<JobType> for JobId {
    fn from(job_type: JobType) -> Self {
        JobId::Unique(job_type)
    }
}

impl From<&JobType> for JobId {
    fn from(job_type: &JobType) -> Self {
        JobId::Unique(job_type.clone())
    }
}

#[derive(Clone)]
pub struct Jobs {
    _pool: PgPool,
    repo: JobRepo,
    executor: JobExecutor,
    registry: Arc<RwLock<JobRegistry>>,
}

impl Jobs {
    pub fn new(pool: &PgPool, config: JobExecutorConfig) -> Self {
        let repo = JobRepo::new(pool);
        let registry = Arc::new(RwLock::new(JobRegistry::new()));
        let executor = JobExecutor::new(pool, config, Arc::clone(&registry), &repo);
        Self {
            _pool: pool.clone(),
            repo,
            executor,
            registry,
        }
    }

    pub fn add_initializer<I: JobInitializer>(&self, initializer: I) {
        let mut registry = self.registry.try_write().expect("Could not lock registry");
        registry.add_initializer(initializer);
    }

    #[instrument(name = "lava.jobs.create_and_spawn", skip(self, db, config))]
    pub async fn create_and_spawn_in_tx<I: JobInitializer, C: serde::Serialize>(
        &self,
        db: &mut sqlx::Transaction<'_, sqlx::Postgres>,
        id: impl Into<JobId> + std::fmt::Debug,
        config: C,
    ) -> Result<Job, JobError> {
        let new_job = NewJob::builder()
            .id(id.into())
            .job_type(<I as JobInitializer>::job_type())
            .config(config)?
            .build()
            .expect("Could not build new job");
        let job = self.repo.create_in_tx(db, new_job).await?;
        self.executor.spawn_job::<I>(db, &job, None).await?;
        Ok(job)
    }

    #[instrument(name = "lava.jobs.create_and_spawn", skip(self, db, config))]
    pub async fn create_and_spawn_unique_in_tx<I: JobInitializer, C: serde::Serialize>(
        &self,
        db: &mut sqlx::Transaction<'_, sqlx::Postgres>,
        config: C,
    ) -> Result<Job, JobError> {
        let job_type = <I as JobInitializer>::job_type();
        let new_job = NewJob::builder()
            .id(&job_type)
            .job_type(job_type)
            .config(config)?
            .build()
            .expect("Could not build new job");
        let job = self.repo.create_in_tx(db, new_job).await?;
        self.executor.spawn_job::<I>(db, &job, None).await?;
        Ok(job)
    }

    #[instrument(name = "lava.jobs.create_and_spawn_at", skip(self, db, config))]
    pub async fn create_and_spawn_at_in_tx<I: JobInitializer, C: serde::Serialize>(
        &self,
        db: &mut sqlx::Transaction<'_, sqlx::Postgres>,
        id: impl Into<JobId> + std::fmt::Debug,
        config: C,
        schedule_at: DateTime<Utc>,
    ) -> Result<Job, JobError> {
        let new_job = NewJob::builder()
            .id(id.into())
            .job_type(<I as JobInitializer>::job_type())
            .config(config)?
            .build()
            .expect("Could not build new job");
        let job = self.repo.create_in_tx(db, new_job).await?;
        self.executor
            .spawn_job::<I>(db, &job, Some(schedule_at))
            .await?;
        Ok(job)
    }

    #[instrument(name = "lava.jobs.create_and_spawn_at", skip(self, db, config))]
    pub async fn create_and_spawn_unique_at_in_tx<I: JobInitializer, C: serde::Serialize>(
        &self,
        db: &mut sqlx::Transaction<'_, sqlx::Postgres>,
        config: C,
        schedule_at: DateTime<Utc>,
    ) -> Result<Job, JobError> {
        let job_type = <I as JobInitializer>::job_type();
        let new_job = NewJob::builder()
            .id(&job_type)
            .job_type(job_type)
            .config(config)?
            .build()
            .expect("Could not build new job");
        let job = self.repo.create_in_tx(db, new_job).await?;
        self.executor
            .spawn_job::<I>(db, &job, Some(schedule_at))
            .await?;
        Ok(job)
    }

    #[instrument(name = "cala_server.jobs.find", skip(self))]
    pub async fn find(&self, id: JobId) -> Result<Job, JobError> {
        self.repo.find_by_id(id).await
    }

    pub async fn start_poll(&mut self) -> Result<(), JobError> {
        self.executor.start_poll().await
    }
}

mod id_sqlx {
    use sqlx::{encode::*, postgres::*, *};

    use std::{fmt, str::FromStr};

    use super::JobId;
    use crate::JobType;

    impl fmt::Display for JobId {
        fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
            match self {
                JobId::Id(uuid) => write!(f, "id:{}", uuid),
                JobId::Unique(job_type) => write!(f, "unique:{}", job_type),
            }
        }
    }

    impl FromStr for JobId {
        type Err = Box<dyn std::error::Error + Sync + Send>;

        fn from_str(s: &str) -> Result<Self, Self::Err> {
            match s.split_once(':') {
                Some(("id", uuid_str)) => Ok(JobId::Id(uuid::Uuid::parse_str(uuid_str)?)),
                Some(("unique", job_type_str)) => Ok(JobId::Unique(JobType::from_string(
                    job_type_str.to_string(),
                ))),
                _ => Err("Invalid format".into()),
            }
        }
    }
    impl Type<Postgres> for JobId {
        fn type_info() -> PgTypeInfo {
            <String as Type<Postgres>>::type_info()
        }

        fn compatible(ty: &PgTypeInfo) -> bool {
            <String as Type<Postgres>>::compatible(ty)
        }
    }

    impl<'q> sqlx::Encode<'q, Postgres> for JobId {
        fn encode_by_ref(
            &self,
            buf: &mut sqlx::postgres::PgArgumentBuffer,
        ) -> Result<IsNull, Box<dyn std::error::Error + Sync + Send>> {
            <String as sqlx::Encode<'_, Postgres>>::encode(self.to_string(), buf)
        }
    }

    impl<'r> sqlx::Decode<'r, Postgres> for JobId {
        fn decode(value: PgValueRef<'r>) -> Result<Self, Box<dyn std::error::Error + Sync + Send>> {
            let s = <String as sqlx::Decode<Postgres>>::decode(value)?;
            s.parse()
        }
    }

    impl PgHasArrayType for JobId {
        fn array_type_info() -> sqlx::postgres::PgTypeInfo {
            <String as sqlx::postgres::PgHasArrayType>::array_type_info()
        }
    }
}
