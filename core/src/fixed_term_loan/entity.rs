use derive_builder::Builder;
use serde::{Deserialize, Serialize};

use crate::{entity::*, ledger::fixed_term_loan::FixedTermLoanAccountIds, primitives::*};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum FixedTermLoanEvent {
    Initialized {
        id: FixedTermLoanId,
        user_id: UserId,
        account_ids: FixedTermLoanAccountIds,
    },
    CollateralizationAdded {},
}

impl EntityEvent for FixedTermLoanEvent {
    type EntityId = FixedTermLoanId;
    fn event_table_name() -> &'static str {
        "fixed_term_loan_events"
    }
}

#[derive(Builder)]
#[builder(pattern = "owned", build_fn(error = "EntityError"))]
pub struct FixedTermLoan {
    pub id: FixedTermLoanId,
    pub user_id: UserId,
    pub account_ids: FixedTermLoanAccountIds,
    pub(super) _events: EntityEvents<FixedTermLoanEvent>,
}

impl Entity for FixedTermLoan {
    type Event = FixedTermLoanEvent;
}

impl TryFrom<EntityEvents<FixedTermLoanEvent>> for FixedTermLoan {
    type Error = EntityError;

    fn try_from(events: EntityEvents<FixedTermLoanEvent>) -> Result<Self, Self::Error> {
        let mut builder = FixedTermLoanBuilder::default();
        for event in events.iter() {
            match event {
                FixedTermLoanEvent::Initialized {
                    id,
                    user_id,
                    account_ids,
                } => {
                    builder = builder
                        .id(*id)
                        .user_id(*user_id)
                        .account_ids(account_ids.clone());
                }
                FixedTermLoanEvent::CollateralizationAdded { .. } => {}
            }
        }
        builder._events(events).build()
    }
}

#[derive(Debug, Builder)]
pub struct NewFixedTermLoan {
    #[builder(setter(into))]
    pub(super) id: FixedTermLoanId,
    #[builder(setter(into))]
    pub(super) user_id: UserId,
    #[builder(setter(into))]
    pub(super) account_ids: FixedTermLoanAccountIds,
}

impl NewFixedTermLoan {
    pub fn builder() -> NewFixedTermLoanBuilder {
        NewFixedTermLoanBuilder::default()
    }

    pub(super) fn initial_events(self) -> EntityEvents<FixedTermLoanEvent> {
        EntityEvents::init(
            self.id,
            [FixedTermLoanEvent::Initialized {
                id: self.id,
                user_id: self.user_id,
                account_ids: self.account_ids,
            }],
        )
    }
}
