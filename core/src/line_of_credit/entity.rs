use derive_builder::Builder;
use serde::{Deserialize, Serialize};

use crate::{entity::*, primitives::*};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum LineOfCreditContractEvent {
    Initialized {
        id: LineOfCreditContractId,
        user_id: UserId,
    },
}

impl EntityEvent for LineOfCreditContractEvent {
    type EntityId = LineOfCreditContractId;
    fn event_table_name() -> &'static str {
        "line_of_credit_contract_events"
    }
}

#[derive(Builder)]
#[builder(pattern = "owned", build_fn(error = "EntityError"))]
pub struct LineOfCreditContract {
    pub id: LineOfCreditContractId,
    pub user_id: UserId,
    pub(super) _events: EntityEvents<LineOfCreditContractEvent>,
}

impl Entity for LineOfCreditContract {
    type Event = LineOfCreditContractEvent;
}

impl TryFrom<EntityEvents<LineOfCreditContractEvent>> for LineOfCreditContract {
    type Error = EntityError;

    fn try_from(events: EntityEvents<LineOfCreditContractEvent>) -> Result<Self, Self::Error> {
        let mut builder = LineOfCreditContractBuilder::default();
        for event in events.iter() {
            match event {
                LineOfCreditContractEvent::Initialized { id, user_id } => {
                    builder = builder.id(*id).user_id(*user_id);
                }
            }
        }
        builder._events(events).build()
    }
}

#[derive(Debug, Builder)]
pub struct NewLineOfCreditContract {
    #[builder(setter(into))]
    pub(super) id: LineOfCreditContractId,
    #[builder(setter(into))]
    pub(super) user_id: UserId,
}

impl NewLineOfCreditContract {
    pub fn builder() -> NewLineOfCreditContractBuilder {
        NewLineOfCreditContractBuilder::default()
    }

    pub(super) fn initial_events(self) -> EntityEvents<LineOfCreditContractEvent> {
        EntityEvents::init(
            self.id,
            [LineOfCreditContractEvent::Initialized {
                id: self.id,
                user_id: self.user_id,
            }],
        )
    }
}
