use async_trait::async_trait;
use serde::{Deserialize, Serialize};
use uuid::{uuid, Uuid};

use std::time::Duration;

use crate::{
    audit::*,
    authorization::{LoanAction, Object},
    job::*,
    loan::{repo::*, terms::CVLPct, LoanByCreatedAtCursor, Subject, SystemNode},
    price::Price,
};

pub(crate) const CVL_JOB_ID: Uuid = uuid!("00000000-0000-0000-0000-000000000001");

#[serde_with::serde_as]
#[derive(Clone, Serialize, Deserialize)]
pub struct LoanJobConfig {
    #[serde_as(as = "serde_with::DurationSeconds<u64>")]
    pub job_interval: Duration,
    pub upgrade_buffer_cvl_pct: CVLPct,
}

pub struct LoanProcessingJobInitializer {
    repo: LoanRepo,
    audit: Audit,
    price: Price,
}

impl LoanProcessingJobInitializer {
    pub fn new(repo: LoanRepo, price: &Price, audit: &Audit) -> Self {
        Self {
            repo,
            price: price.clone(),
            audit: audit.clone(),
        }
    }
}

const LOAN_CVL_PROCESSING_JOB: JobType = JobType::new("loan-cvl-processing");
impl JobInitializer for LoanProcessingJobInitializer {
    fn job_type() -> JobType
    where
        Self: Sized,
    {
        LOAN_CVL_PROCESSING_JOB
    }

    fn init(&self, job: &Job) -> Result<Box<dyn JobRunner>, Box<dyn std::error::Error>> {
        Ok(Box::new(LoanProcessingJobRunner {
            config: job.config()?,
            repo: self.repo.clone(),
            price: self.price.clone(),
            audit: self.audit.clone(),
        }))
    }
}

pub struct LoanProcessingJobRunner {
    config: LoanJobConfig,
    repo: LoanRepo,
    price: Price,
    audit: Audit,
}

#[async_trait]
impl JobRunner for LoanProcessingJobRunner {
    async fn run(
        &self,
        _current_job: CurrentJob,
    ) -> Result<JobCompletion, Box<dyn std::error::Error>> {
        let price = self.price.usd_cents_per_btc().await?;
        let audit_info = self
            .audit
            .record_entry(
                &Subject::System(SystemNode::Core),
                Object::Loan,
                LoanAction::UpdateCollateralizationState,
                true,
            )
            .await?;

        let mut has_next_page = true;
        let mut after: Option<LoanByCreatedAtCursor> = None;
        while has_next_page {
            let mut loans = self
                .repo
                .list(crate::query::PaginatedQueryArgs::<LoanByCreatedAtCursor> {
                    first: 100,
                    after,
                })
                .await?;
            (after, has_next_page) = (loans.end_cursor, loans.has_next_page);

            for loan in loans.entities.iter_mut() {
                if loan
                    .maybe_update_collateralization(
                        price,
                        self.config.upgrade_buffer_cvl_pct,
                        audit_info,
                    )
                    .is_some()
                {
                    self.repo.persist(loan).await?;
                }
            }
        }

        Ok(JobCompletion::RescheduleAt(
            chrono::Utc::now() + self.config.job_interval,
        ))
    }
}
