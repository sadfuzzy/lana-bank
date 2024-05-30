use derive_builder::Builder;
use serde::{Deserialize, Serialize};

use crate::{
    entity::*,
    primitives::{LedgerAccountId, UserId, WithdrawId},
};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum WithdrawEvent {
    Initialized {
        id: WithdrawId,
        user_id: UserId,
        account_id: LedgerAccountId,
    },
}

impl EntityEvent for WithdrawEvent {
    type EntityId = WithdrawId;
    fn event_table_name() -> &'static str {
        "withdraw_events"
    }
}

#[derive(Builder)]
#[builder(pattern = "owned", build_fn(error = "EntityError"))]
pub struct Withdraw {
    pub id: WithdrawId,
    pub user_id: UserId,
    pub account_id: LedgerAccountId,
    pub(super) _events: EntityEvents<WithdrawEvent>,
}

impl Entity for Withdraw {
    type Event = WithdrawEvent;
}

impl TryFrom<EntityEvents<WithdrawEvent>> for Withdraw {
    type Error = EntityError;

    fn try_from(events: EntityEvents<WithdrawEvent>) -> Result<Self, Self::Error> {
        let mut builder = WithdrawBuilder::default();
        for event in events.iter() {
            match event {
                WithdrawEvent::Initialized {
                    id,
                    user_id,
                    account_id,
                } => {
                    builder = builder.id(*id).user_id(*user_id).account_id(*account_id);
                }
            }
        }
        builder._events(events).build()
    }
}

#[derive(Debug, Builder)]
pub struct NewWithdraw {
    #[builder(setter(into))]
    pub(super) id: WithdrawId,
    #[builder(setter(into))]
    pub(super) user_id: UserId,
    #[builder(setter(into))]
    pub(super) account_id: LedgerAccountId,
}

impl NewWithdraw {
    pub fn builder() -> NewWithdrawBuilder {
        NewWithdrawBuilder::default()
    }

    pub(super) fn initial_events(self) -> EntityEvents<WithdrawEvent> {
        EntityEvents::init(
            self.id,
            [WithdrawEvent::Initialized {
                id: self.id,
                user_id: self.user_id,
                account_id: self.account_id,
            }],
        )
    }
}
