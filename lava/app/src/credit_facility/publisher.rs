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
        _entity: &CreditFacility,
        new_events: es_entity::LastPersisted<'_, CreditFacilityEvent>,
    ) -> Result<(), CreditFacilityError> {
        self.export
            .es_entity_export(db, BQ_TABLE_NAME, new_events.clone())
            .await?;

        use CreditFacilityEvent::*;
        let publish_events = new_events
            .filter_map(|event| match &event.event {
                Initialized { .. } => Some(CreditEvent::CreditFacilityCreated),
                Activated { .. } => Some(CreditEvent::CreditFacilityActivated),
                Completed { .. } => Some(CreditEvent::CreditFacilityCompleted),
                _ => None,
            })
            .collect::<Vec<_>>();
        self.outbox.persist_all(db, publish_events).await?;
        Ok(())
    }
}
