use async_trait::async_trait;
use chrono::{DateTime, Utc};

use super::{
    current::CurrentJob,
    entity::{Job, JobType},
};

pub trait JobInitializer: Send + Sync + 'static {
    fn job_type() -> JobType
    where
        Self: Sized;

    fn retry_on_error_settings() -> RetrySettings
    where
        Self: Sized,
    {
        Default::default()
    }

    fn init(&self, job: &Job) -> Result<Box<dyn JobRunner>, Box<dyn std::error::Error>>;
}

pub enum JobCompletion {
    Complete,
    CompleteWithTx(sqlx::Transaction<'static, sqlx::Postgres>),
    RescheduleAt(DateTime<Utc>),
    RescheduleAtWithTx(sqlx::Transaction<'static, sqlx::Postgres>, DateTime<Utc>),
}

#[async_trait]
pub trait JobRunner: Send + Sync + 'static {
    async fn run(
        &self,
        current_job: CurrentJob,
    ) -> Result<JobCompletion, Box<dyn std::error::Error>>;
}

pub struct RetrySettings {
    pub n_attempts: u32,
    pub n_warn_attempts: u32,
    pub min_backoff: std::time::Duration,
    pub max_backoff: std::time::Duration,
    pub backoff_jitter_pct: u32,
}

impl RetrySettings {
    pub(super) fn next_attempt_at(&self, attempt: u32) -> DateTime<Utc> {
        use rand::Rng;
        let base_backoff_ms = self.min_backoff.as_millis() * 2u128.pow(attempt - 1);
        let jitter_range =
            (base_backoff_ms as f64 * self.backoff_jitter_pct as f64 / 100.0) as i128;
        let jitter = rand::thread_rng().gen_range(-jitter_range..=jitter_range);
        let jittered_backoff = (base_backoff_ms as i128 + jitter).max(0) as u128;
        let final_backoff = std::cmp::min(jittered_backoff, self.max_backoff.as_millis());
        Utc::now() + std::time::Duration::from_millis(final_backoff as u64)
    }
}

impl Default for RetrySettings {
    fn default() -> Self {
        Self {
            n_attempts: 5,
            n_warn_attempts: 3,
            min_backoff: std::time::Duration::from_secs(1),
            max_backoff: std::time::Duration::from_secs(60),
            backoff_jitter_pct: 20,
        }
    }
}
