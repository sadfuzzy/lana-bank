const BQ_TABLE_NAME: &str = "credit_facility_events";

use lava_events::CreditEvent;

use crate::{data_export::Export, outbox::Outbox};

use super::{entity::*, error::*};

#[derive(Clone)]
pub struct CreditFacilityPublisher {
    export: Export,
    outbox: Outbox,
}

impl CreditFacilityPublisher {
    pub fn new(export: &Export, outbox: &Outbox) -> Self {
        Self {
            export: export.clone(),
            outbox: outbox.clone(),
        }
    }

    pub async fn publish(
        &self,
        db: &mut sqlx::Transaction<'_, sqlx::Postgres>,
        entity: &CreditFacility,
        new_events: es_entity::LastPersisted<'_, CreditFacilityEvent>,
    ) -> Result<(), CreditFacilityError> {
        self.export
            .es_entity_export(db, BQ_TABLE_NAME, new_events.clone())
            .await?;

        use CreditFacilityEvent::*;
        let publish_events = new_events
            .filter_map(|event| match &event.event {
                Initialized { .. } => Some(CreditEvent::CreditFacilityCreated {
                    created_at: entity.created_at(),
                }),
                Activated { activated_at, .. } => Some(CreditEvent::CreditFacilityActivated {
                    activated_at: *activated_at,
                }),
                Completed { completed_at, .. } => Some(CreditEvent::CreditFacilityCompleted {
                    completed_at: *completed_at,
                }),
                DisbursalConcluded {
                    idx, recorded_at, ..
                } => {
                    let amount = entity.disbursal_amount_from_idx(*idx);
                    Some(CreditEvent::DisbursalConcluded {
                        amount: amount.into_inner(),
                        recorded_at: *recorded_at,
                    })
                }
                PaymentRecorded {
                    disbursal_amount,
                    recorded_in_ledger_at,
                    ..
                } => Some(CreditEvent::PaymentRecorded {
                    disbursal_amount: disbursal_amount.into_inner(),
                    recorded_at: *recorded_in_ledger_at,
                }),
                CollateralUpdated {
                    abs_diff,
                    action,
                    recorded_in_ledger_at,
                    ..
                } => match action {
                    crate::primitives::CollateralAction::Add => {
                        Some(CreditEvent::CollateralAdded {
                            amount: abs_diff.into_inner(),
                            recorded_at: *recorded_in_ledger_at,
                        })
                    }
                    crate::primitives::CollateralAction::Remove => {
                        Some(CreditEvent::CollateralRemoved {
                            amount: abs_diff.into_inner(),
                            recorded_at: *recorded_in_ledger_at,
                        })
                    }
                },

                _ => None,
            })
            .collect::<Vec<_>>();
        self.outbox.persist_all(db, publish_events).await?;
        Ok(())
    }
}
