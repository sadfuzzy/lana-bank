use async_trait::async_trait;
use futures::StreamExt;

use governance::GovernanceEvent;
use job::*;
use lava_events::LavaEvent;
use rbac_types::{AppObject, Subject, WithdrawAction};

use crate::{
    audit::{Audit, AuditSvc},
    outbox::Outbox,
};

use super::repo::WithdrawRepo;

pub(super) struct WithdrawApprovalJobInitializer {
    pool: sqlx::PgPool,
    repo: WithdrawRepo,
    audit: Audit,
    outbox: Outbox,
}

impl WithdrawApprovalJobInitializer {
    pub fn new(pool: &sqlx::PgPool, repo: &WithdrawRepo, audit: &Audit, outbox: &Outbox) -> Self {
        Self {
            pool: pool.clone(),
            repo: repo.clone(),
            audit: audit.clone(),
            outbox: outbox.clone(),
        }
    }
}

const WITHDRAW_APPROVE_JOB: JobType = JobType::new("withdraw-approval");
impl JobInitializer for WithdrawApprovalJobInitializer {
    fn job_type() -> JobType
    where
        Self: Sized,
    {
        WITHDRAW_APPROVE_JOB
    }

    fn init(&self, _: &Job) -> Result<Box<dyn JobRunner>, Box<dyn std::error::Error>> {
        Ok(Box::new(WithdrawApprovalJobRunner {
            pool: self.pool.clone(),
            repo: self.repo.clone(),
            audit: self.audit.clone(),
            outbox: self.outbox.clone(),
        }))
    }

    fn retry_on_error_settings() -> RetrySettings
    where
        Self: Sized,
    {
        RetrySettings::repeat_indefinitely()
    }
}

#[derive(Default, Clone, Copy, serde::Deserialize, serde::Serialize)]
struct WithdrawApprovalJobData {
    sequence: outbox::EventSequence,
}

pub struct WithdrawApprovalJobRunner {
    pool: sqlx::PgPool,
    repo: WithdrawRepo,
    audit: Audit,
    outbox: Outbox,
}
#[async_trait]
impl JobRunner for WithdrawApprovalJobRunner {
    #[allow(clippy::single_match)]
    async fn run(
        &self,
        mut current_job: CurrentJob,
    ) -> Result<JobCompletion, Box<dyn std::error::Error>> {
        let mut state = current_job
            .execution_data::<WithdrawApprovalJobData>()?
            .unwrap_or_default();
        let mut stream = self.outbox.listen_persisted(Some(state.sequence)).await?;

        while let Some(message) = stream.next().await {
            match message.payload {
                Some(LavaEvent::Governance(GovernanceEvent::ApprovalProcessConcluded {
                    id,
                    approved,
                })) => {
                    let mut withdraw = self.repo.find_by_approval_process_id(id).await?;
                    let audit_info = self
                        .audit
                        .record_entry(
                            &Subject::core(),
                            AppObject::Withdraw,
                            WithdrawAction::ConcludeApprovalProcess,
                            true,
                        )
                        .await?;
                    withdraw.approval_process_concluded(approved, audit_info);
                    let mut db = self.pool.begin().await?;
                    self.repo.update_in_tx(&mut db, &mut withdraw).await?;
                    state.sequence = message.sequence;
                    current_job.update_execution_data(&mut db, state).await?;
                    db.commit().await?;
                }
                _ => {}
            }
        }

        Ok(JobCompletion::RescheduleAt(chrono::Utc::now()))
    }
}
