use derive_builder::Builder;
use serde::{Deserialize, Serialize};

use crate::{
    entity::*,
    primitives::{
        LedgerTxId, TransactionConfirmation, UsdCents, UserId, WithdrawId, WithdrawalDestination,
    },
};

use super::error::WithdrawError;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum WithdrawEvent {
    Initialized {
        id: WithdrawId,
        user_id: UserId,
    },
    UsdInitiated {
        tx_id: LedgerTxId,
        reference: String,
        destination: WithdrawalDestination,
        amount: UsdCents,
    },
    UsdSettled {
        tx_id: LedgerTxId,
        reference: String,
        confirmation: TransactionConfirmation,
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
        tx_id: LedgerTxId,
        amount: UsdCents,
        destination: WithdrawalDestination,
        reference: String,
    ) -> Result<(), WithdrawError> {
        self.events.push(WithdrawEvent::UsdInitiated {
            tx_id,
            destination,
            reference,
            amount,
        });
        Ok(())
    }

    pub fn settle(
        &mut self,
        tx_id: LedgerTxId,
        confirmation: TransactionConfirmation,
        withdrawal_reference: String,
    ) -> Result<UsdCents, WithdrawError> {
        for event in self.events.iter() {
            if let WithdrawEvent::UsdSettled {
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
                if let WithdrawEvent::UsdInitiated {
                    reference, amount, ..
                } = event
                {
                    if *reference == withdrawal_reference {
                        return Some(*amount);
                    }
                }
                None
            })
            .ok_or_else(|| {
                WithdrawError::CouldNotEventFindByReference(withdrawal_reference.clone())
            })?;

        self.events.push(WithdrawEvent::UsdSettled {
            tx_id,
            reference: withdrawal_reference,
            confirmation,
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
                WithdrawEvent::UsdInitiated { .. } => {}
                WithdrawEvent::UsdSettled { .. } => {}
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
