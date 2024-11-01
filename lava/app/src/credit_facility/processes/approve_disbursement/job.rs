use async_trait::async_trait;
use futures::StreamExt;

use governance::GovernanceEvent;
use job::*;
use lava_events::LavaEvent;

use super::ApproveDisbursement;
use crate::outbox::Outbox;

#[derive(serde::Serialize)]
pub(in crate::credit_facility) struct DisbursementApprovalJobConfig;
impl JobConfig for DisbursementApprovalJobConfig {
    type Initializer = DisbursementApprovalJobInitializer;
}

pub(in crate::credit_facility) struct DisbursementApprovalJobInitializer {
    outbox: Outbox,
    process: ApproveDisbursement,
}

impl DisbursementApprovalJobInitializer {
    pub fn new(outbox: &Outbox, process: &ApproveDisbursement) -> Self {
        Self {
            process: process.clone(),
            outbox: outbox.clone(),
        }
    }
}

const DISBURSEMENT_APPROVE_JOB: JobType = JobType::new("disbursement");
impl JobInitializer for DisbursementApprovalJobInitializer {
    fn job_type() -> JobType
    where
        Self: Sized,
    {
        DISBURSEMENT_APPROVE_JOB
    }

    fn init(&self, _: &Job) -> Result<Box<dyn JobRunner>, Box<dyn std::error::Error>> {
        Ok(Box::new(DisbursementApprovalJobRunner {
            outbox: self.outbox.clone(),
            process: self.process.clone(),
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
struct DisbursementApprovalJobData {
    sequence: outbox::EventSequence,
}

pub struct DisbursementApprovalJobRunner {
    outbox: Outbox,
    process: ApproveDisbursement,
}
#[async_trait]
impl JobRunner for DisbursementApprovalJobRunner {
    #[allow(clippy::single_match)]
    async fn run(
        &self,
        mut current_job: CurrentJob,
    ) -> Result<JobCompletion, Box<dyn std::error::Error>> {
        let mut state = current_job
            .execution_state::<DisbursementApprovalJobData>()?
            .unwrap_or_default();
        let mut stream = self.outbox.listen_persisted(Some(state.sequence)).await?;

        while let Some(message) = stream.next().await {
            match message.payload {
                Some(LavaEvent::Governance(GovernanceEvent::ApprovalProcessConcluded {
                    id,
                    approved,
                    ref process_type,
                    ..
                })) if process_type == &super::APPROVE_DISBURSEMENT_PROCESS => {
                    self.process.execute(id, approved).await?;
                    state.sequence = message.sequence;
                    current_job.update_execution_state(state).await?;
                }
                _ => {}
            }
        }

        Ok(JobCompletion::RescheduleAt(chrono::Utc::now()))
    }
}
