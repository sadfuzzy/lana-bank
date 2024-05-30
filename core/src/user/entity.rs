use derive_builder::Builder;
use serde::{Deserialize, Serialize};

use crate::{entity::*, ledger::user::UserLedgerAccountIds, primitives::*};

use super::error::UserError;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum UserEvent {
    Initialized {
        id: UserId,
        bitfinex_username: String,
        account_ids: UserLedgerAccountIds,
    },
    WithdrawalInitiated {
        tx_id: LedgerTxId,
        reference: String,
        destination: WithdrawalDestination,
        amount: CurrencyAmount, // should this be some sort of Money type instead?
    },
    WithdrawalSettled {
        tx_id: LedgerTxId,
        reference: String,
        confirmation: TransactionConfirmation,
        amount: CurrencyAmount, // should this be some sort of Money type instead?
    },
}

impl EntityEvent for UserEvent {
    type EntityId = UserId;
    fn event_table_name() -> &'static str {
        "user_events"
    }
}

#[derive(Builder)]
#[builder(pattern = "owned", build_fn(error = "EntityError"))]
pub struct User {
    pub id: UserId,
    pub bitfinex_username: String,
    pub account_ids: UserLedgerAccountIds,
    pub(super) events: EntityEvents<UserEvent>,
}

impl User {
    pub fn initiate_withdrawal(
        &mut self,
        tx_id: LedgerTxId,
        amount: UsdCents,
        destination: WithdrawalDestination,
        reference: String,
    ) -> Result<(), UserError> {
        self.events.push(UserEvent::WithdrawalInitiated {
            tx_id,
            destination,
            reference,
            amount: CurrencyAmount::UsdCents(amount),
        });
        Ok(())
    }

    pub fn settle_withdrawal(
        &mut self,
        tx_id: LedgerTxId,
        confirmation: TransactionConfirmation,
        withdrawal_reference: String,
    ) -> Result<UsdCents, UserError> {
        let amount = self
            .events
            .iter()
            .find_map(|event| {
                if let UserEvent::WithdrawalInitiated {
                    reference, amount, ..
                } = event
                {
                    if *reference == withdrawal_reference {
                        return Some(*amount);
                    }
                }
                None
            })
            .ok_or_else(|| UserError::CouldNotEventFindByReference(withdrawal_reference.clone()))?;

        self.events.push(UserEvent::WithdrawalSettled {
            tx_id,
            reference: withdrawal_reference,
            confirmation,
            amount,
        });

        amount
            .as_usd_cents()
            .ok_or_else(|| UserError::UnexpectedCurrency)
    }
}

impl Entity for User {
    type Event = UserEvent;
}

impl TryFrom<EntityEvents<UserEvent>> for User {
    type Error = EntityError;

    fn try_from(events: EntityEvents<UserEvent>) -> Result<Self, Self::Error> {
        let mut builder = UserBuilder::default();
        for event in events.iter() {
            match event {
                UserEvent::Initialized {
                    id,
                    bitfinex_username,
                    account_ids,
                } => {
                    builder = builder
                        .id(*id)
                        .bitfinex_username(bitfinex_username.clone())
                        .account_ids(*account_ids);
                }
                UserEvent::WithdrawalInitiated { .. } => {}
                UserEvent::WithdrawalSettled { .. } => {}
            }
        }
        builder.events(events).build()
    }
}

#[derive(Debug, Builder)]
pub struct NewUser {
    #[builder(setter(into))]
    pub(super) id: UserId,
    #[builder(setter(into))]
    pub(super) bitfinex_username: String,
    pub(super) account_ids: UserLedgerAccountIds,
}

impl NewUser {
    pub fn builder() -> NewUserBuilder {
        NewUserBuilder::default()
    }

    pub(super) fn initial_events(self) -> EntityEvents<UserEvent> {
        EntityEvents::init(
            self.id,
            [UserEvent::Initialized {
                id: self.id,
                bitfinex_username: self.bitfinex_username,
                account_ids: self.account_ids,
            }],
        )
    }
}
