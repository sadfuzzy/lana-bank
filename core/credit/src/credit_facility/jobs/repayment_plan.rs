use chrono::{DateTime, Utc};
use futures::StreamExt;

use std::collections::HashMap;

use job::{CurrentJob, Job, JobCompletion, JobInitializer, JobRunner, JobType};
use outbox::{EventSequence, Outbox};

use crate::{
    primitives::*, CoreCreditEvent, CreditFacilityEvent, CreditFacilityReceivable, TermValues,
};

#[derive(Debug, serde::Deserialize, serde::Serialize)]
struct CreditFacilityCreated {
    terms: TermValues,
}

#[derive(Debug, serde::Deserialize, serde::Serialize)]
struct CreditFacilityActivated {
    activated_at: DateTime<Utc>,
}

#[derive(Debug, serde::Deserialize, serde::Serialize)]
#[serde(tag = "type")]
enum RepaymentPlanEntry {
    Creation(CreditFacilityCreated),
    Activation(CreditFacilityActivated),
}

#[derive(Default, Clone, serde::Deserialize, serde::Serialize)]
struct RepaymentPlanProjectionData {
    sequence: EventSequence,
}

pub struct RepaymentPlanProjectionRunner {
    outbox: Outbox<CoreCreditEvent>,
}

#[async_trait::async_trait]
impl JobRunner for RepaymentPlanProjectionRunner {
    async fn run(
        &self,
        mut current_job: CurrentJob,
    ) -> Result<JobCompletion, Box<dyn std::error::Error>> {
        use CoreCreditEvent::*;

        let mut state = current_job
            .execution_state::<RepaymentPlanProjectionData>()?
            .unwrap_or_default();

        let mut stream = self.outbox.listen_persisted(Some(state.sequence)).await?;

        let mut new_events: HashMap<CreditFacilityId, Vec<RepaymentPlanEntry>> = Default::default();

        while let Some(message) = stream.next().await {
            if let Some(event) = &message.payload {
                match event {
                    FacilityCreated { id, terms, .. } => {
                        new_events
                            .entry(*id)
                            .or_default()
                            .push(RepaymentPlanEntry::Creation(CreditFacilityCreated {
                                terms: *terms,
                            }));
                    }
                    FacilityActivated {
                        id, activated_at, ..
                    } => {
                        new_events
                            .entry(*id)
                            .or_default()
                            .push(RepaymentPlanEntry::Activation(CreditFacilityActivated {
                                activated_at: *activated_at,
                            }));
                    }
                    DisbursalSettled { .. } => {}
                    AccrualPosted { .. } => {}
                    FacilityRepaymentRecorded { .. } => {}
                    _ => {}
                }
            }
        }

        for (id, events) in new_events {
            let json = serde_json::to_value(&events).expect("");
            // UPDATE SET repayment_plan = repayment_plan || $json WHERE id = $id
        }

        Ok(JobCompletion::RescheduleNow)
    }
}

pub struct RepaymentPlanProjectionInitializer {
    outbox: Outbox<CoreCreditEvent>,
}

impl RepaymentPlanProjectionInitializer {
    pub fn new(outbox: &Outbox<CoreCreditEvent>) -> Self {
        Self {
            outbox: outbox.clone(),
        }
    }
}

const REPAYMENT_PLAN_PROJECTION: JobType =
    JobType::new("credit-facility-repayment-plan-projection");
impl JobInitializer for RepaymentPlanProjectionInitializer {
    fn job_type() -> JobType
    where
        Self: Sized,
    {
        REPAYMENT_PLAN_PROJECTION
    }

    fn init(&self, _: &Job) -> Result<Box<dyn JobRunner>, Box<dyn std::error::Error>> {
        Ok(Box::new(RepaymentPlanProjectionRunner {
            outbox: self.outbox.clone(),
        }))
    }
}
