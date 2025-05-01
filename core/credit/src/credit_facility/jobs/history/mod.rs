mod entry;
mod error;
mod repo;

use std::collections::HashMap;

use futures::StreamExt;

use job::{CurrentJob, Job, JobCompletion, JobInitializer, JobRunner, JobType};
use outbox::{EventSequence, Outbox};

use crate::{CoreCreditEvent, CreditFacilityId};

use entry::*;
use repo::*;

#[derive(Default, Clone, serde::Deserialize, serde::Serialize)]
struct HistoryProjectionData {
    sequence: EventSequence,
}

pub struct HistoryProjectionRunner {
    outbox: Outbox<CoreCreditEvent>,
    repo: HistoryRepo,
}

#[async_trait::async_trait]
impl JobRunner for HistoryProjectionRunner {
    async fn run(
        &self,
        mut current_job: CurrentJob,
    ) -> Result<JobCompletion, Box<dyn std::error::Error>> {
        use CoreCreditEvent::*;

        let mut state = current_job
            .execution_state::<HistoryProjectionData>()?
            .unwrap_or_default();

        let mut new_events: HashMap<CreditFacilityId, Vec<CreditFacilityHistoryEntry>> =
            Default::default();

        let mut stream = self.outbox.listen_persisted(Some(state.sequence)).await?;

        while let Some(message) = stream.next().await {
            if let Some(event) = &message.payload {
                state.sequence = message.sequence;
                match event {
                    FacilityCreated { id, amount, .. } => {
                        new_events.entry(*id).or_default().push(
                            CreditFacilityHistoryEntry::Creation(CreditFacilityCreated {
                                cents: *amount,
                            }),
                        );
                    }
                    FacilityApproved { .. } => {}
                    FacilityActivated {
                        id,
                        activation_tx_id,
                        activated_at,
                    } => {
                        new_events.entry(*id).or_default().push(
                            CreditFacilityHistoryEntry::Origination(CreditFacilityOrigination {
                                recorded_at: *activated_at,
                                tx_id: *activation_tx_id,
                            }),
                        );
                    }
                    FacilityCollateralUpdated {
                        abs_diff,
                        recorded_at,
                        action,
                        credit_facility_id,
                        ledger_tx_id,
                        ..
                    } => {
                        new_events.entry(*credit_facility_id).or_default().push(
                            CreditFacilityHistoryEntry::Collateral(CollateralUpdated {
                                satoshis: *abs_diff,
                                recorded_at: *recorded_at,
                                action: *action,
                                tx_id: *ledger_tx_id,
                            }),
                        );
                    }
                    FacilityCollateralizationChanged {
                        id,
                        state,
                        recorded_at,
                        outstanding,
                        price,
                        ..
                    } => {
                        new_events.entry(*id).or_default().push(
                            CreditFacilityHistoryEntry::Collateralization(
                                CollateralizationUpdated {
                                    state: *state,
                                    outstanding_interest: outstanding.interest,
                                    outstanding_disbursal: outstanding.disbursed,
                                    recorded_at: *recorded_at,
                                    price: *price,
                                },
                            ),
                        );
                    }
                    FacilityRepaymentRecorded {
                        credit_facility_id,
                        payment_id,
                        disbursal_amount,
                        interest_amount,
                        recorded_at,
                    } => {
                        new_events.entry(*credit_facility_id).or_default().push(
                            CreditFacilityHistoryEntry::Payment(IncrementalPayment {
                                recorded_at: *recorded_at,
                                cents: *disbursal_amount + *interest_amount,
                                payment_id: *payment_id,
                            }),
                        );
                    }
                    DisbursalSettled {
                        credit_facility_id,
                        amount,
                        recorded_at,
                        ledger_tx_id,
                    } => {
                        new_events.entry(*credit_facility_id).or_default().push(
                            CreditFacilityHistoryEntry::Disbursal(entry::DisbursalExecuted {
                                cents: *amount,
                                recorded_at: *recorded_at,
                                tx_id: *ledger_tx_id,
                            }),
                        );
                    }
                    AccrualPosted {
                        credit_facility_id,
                        amount,
                        posted_at,
                        ledger_tx_id,
                    } => {
                        new_events.entry(*credit_facility_id).or_default().push(
                            CreditFacilityHistoryEntry::Interest(InterestAccrualsPosted {
                                cents: *amount,
                                recorded_at: *posted_at,
                                tx_id: *ledger_tx_id,
                                days: todo!("jiri"),
                            }),
                        );
                    }
                    FacilityCompleted { id, completed_at } => {
                        new_events.entry(*id).or_default().push(
                            CreditFacilityHistoryEntry::Completion(CreditFacilityCompleted {
                                completed_at: *completed_at,
                            }),
                        );
                    }
                    ObligationCreated { .. } => {}
                    ObligationDue { .. } => {}
                }
            }
        }

        let mut db = self.repo.begin().await?;

        for (id, events) in new_events {
            self.repo.persist_in_tx(&mut db, id, events).await?;
        }

        current_job
            .update_execution_state_in_tx(&mut db, &state)
            .await?;

        db.commit().await?;

        Ok(JobCompletion::RescheduleNow)
    }
}

pub struct HistoryProjectionInitializer {
    outbox: Outbox<CoreCreditEvent>,
    repo: HistoryRepo,
}

impl HistoryProjectionInitializer {
    pub fn new(outbox: &Outbox<CoreCreditEvent>, repo: &HistoryRepo) -> Self {
        Self {
            outbox: outbox.clone(),
            repo: repo.clone(),
        }
    }
}

const HISTORY_PROJECTION: JobType = JobType::new("credit-facility-history-projection");
impl JobInitializer for HistoryProjectionInitializer {
    fn job_type() -> JobType
    where
        Self: Sized,
    {
        HISTORY_PROJECTION
    }

    fn init(&self, _: &Job) -> Result<Box<dyn JobRunner>, Box<dyn std::error::Error>> {
        Ok(Box::new(HistoryProjectionRunner {
            outbox: self.outbox.clone(),
            repo: self.repo.clone(),
        }))
    }
}
