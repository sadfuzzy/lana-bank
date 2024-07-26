use derive_builder::Builder;
use serde::{Deserialize, Serialize};

use crate::{entity::*, primitives::*};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum UserEvent {
    Initialized { id: UserId, email: String },
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
    pub email: String,
    pub(super) _events: EntityEvents<UserEvent>,
}

impl User {}

impl core::fmt::Display for User {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "User: {}, email: {}", self.id, self.email)
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
                UserEvent::Initialized { id, email } => {
                    builder = builder.id(*id).email(email.clone())
                }
            }
        }
        builder._events(events).build()
    }
}

#[derive(Debug, Builder)]
pub struct NewUser {
    #[builder(setter(into))]
    pub(super) id: UserId,
    #[builder(setter(into))]
    pub(super) email: String,
}

impl NewUser {
    pub fn builder() -> NewUserBuilder {
        let user_id = UserId::new();

        let mut builder = NewUserBuilder::default();
        builder.id(user_id);
        builder
    }

    pub(super) fn initial_events(self) -> EntityEvents<UserEvent> {
        EntityEvents::init(
            self.id,
            [UserEvent::Initialized {
                id: self.id,
                email: self.email,
            }],
        )
    }
}
