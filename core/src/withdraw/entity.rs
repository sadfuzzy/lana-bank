use derive_builder::Builder;
use serde::{Deserialize, Serialize};

use crate::{
    entity::*,
    primitives::{LedgerTxId, UsdCents, UserId, WithdrawId},
};

use super::error::WithdrawError;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum WithdrawEvent {
    Initialized {
        id: WithdrawId,
        user_id: UserId,
    },
    Initiated {
        id: WithdrawId,
        tx_id: LedgerTxId,
        reference: String,
        destination: String,
        amount: UsdCents,
    },
    Settled {
        id: WithdrawId,
        tx_id: LedgerTxId,
        reference: String,
        amount: UsdCents,
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
    pub(super) events: EntityEvents<WithdrawEvent>,
}

impl Withdraw {
    pub fn initiate_usd_withdrawal(
        &mut self,
        id: WithdrawId,
        tx_id: LedgerTxId,
        amount: UsdCents,
        destination: String,
        reference: String,
    ) -> Result<(), WithdrawError> {
        self.events.push(WithdrawEvent::Initiated {
            id,
            tx_id,
            destination,
            reference,
            amount,
        });
        Ok(())
    }

    pub fn settle(
        &mut self,
        id: WithdrawId,
        tx_id: LedgerTxId,
        reference: String,
    ) -> Result<UsdCents, WithdrawError> {
        for event in self.events.iter() {
            if let WithdrawEvent::Settled {
                id: id_from_event, ..
            } = event
            {
                if *id_from_event == id {
                    return Err(WithdrawError::AlreadySettled(id));
                }
            }
        }

        let amount = self
            .events
            .iter()
            .find_map(|event| {
                if let WithdrawEvent::Initiated {
                    id: id_from_event,
                    amount,
                    ..
                } = event
                {
                    if *id_from_event == id {
                        return Some(*amount);
                    }
                }
                None
            })
            .ok_or_else(|| WithdrawError::CouldNotFindById(id))?;

        self.events.push(WithdrawEvent::Settled {
            id,
            tx_id,
            reference,
            amount,
        });

        Ok(amount)
    }
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
                WithdrawEvent::Initialized { id, user_id } => {
                    builder = builder.id(*id).user_id(*user_id);
                }
                WithdrawEvent::Initiated { .. } => {}
                WithdrawEvent::Settled { .. } => {}
            }
        }
        builder.events(events).build()
    }
}

#[derive(Debug, Builder)]
pub struct NewWithdraw {
    #[builder(setter(into))]
    pub(super) id: WithdrawId,
    #[builder(setter(into))]
    pub(super) user_id: UserId,
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
            }],
        )
    }
}
