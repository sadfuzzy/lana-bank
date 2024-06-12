use derive_builder::Builder;
use serde::{Deserialize, Serialize};

use crate::{
    entity::*,
    ledger::user::{UserLedgerAccountAddresses, UserLedgerAccountIds},
    primitives::*,
};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum UserEvent {
    Initialized {
        id: UserId,
        bitfinex_username: String,
        account_ids: UserLedgerAccountIds,
        account_addresses: UserLedgerAccountAddresses,
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
    pub account_addresses: UserLedgerAccountAddresses,
    pub(super) events: EntityEvents<UserEvent>,
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
                    account_addresses,
                } => {
                    builder = builder
                        .id(*id)
                        .bitfinex_username(bitfinex_username.clone())
                        .account_ids(*account_ids)
                        .account_addresses(account_addresses.clone());
                }
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
    pub(super) account_addresses: UserLedgerAccountAddresses,
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
                account_addresses: self.account_addresses,
            }],
        )
    }
}
