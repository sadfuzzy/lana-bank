use derive_builder::Builder;
use serde::{Deserialize, Serialize};

use es_entity::*;

#[derive(Debug, Clone, Copy, PartialEq, sqlx::Type, Deserialize, Serialize, Hash, Eq)]
#[sqlx(transparent)]
#[serde(transparent)]
pub struct UserId(uuid::Uuid);

impl From<uuid::Uuid> for UserId {
    fn from(uuid: uuid::Uuid) -> Self {
        Self(uuid)
    }
}

#[derive(EsEvent, Deserialize, Serialize)]
#[serde(tag = "type", rename_all = "snake_case")]
#[es_event(id = "UserId")]
pub enum UserEvent {
    Initialized { id: UserId, email: String },
    RoleAssigned {},
    RoleRevoked {},
}

#[derive(Debug)]
pub struct NewUser {
    pub id: UserId,
    pub email: String,
}

impl IntoEvents<UserEvent> for NewUser {
    fn into_events(self) -> EntityEvents<UserEvent> {
        EntityEvents::init(
            self.id,
            vec![UserEvent::Initialized {
                id: self.id,
                email: self.email,
            }],
        )
    }
}

#[derive(EsEntity, Builder)]
#[builder(pattern = "owned", build_fn(error = "EsEntityError"))]
pub struct User {
    pub id: UserId,
    pub email: String,

    events: EntityEvents<UserEvent>,
}

impl TryFromEvents<UserEvent> for User {
    fn try_from_events(events: EntityEvents<UserEvent>) -> Result<Self, EsEntityError> {
        let mut builder = UserBuilder::default();
        for event in events.iter_persisted().map(|e| &e.event) {
            match event {
                UserEvent::Initialized { id, email } => {
                    builder = builder.id(*id).email(email.clone())
                }
                _ => {}
            }
        }
        builder.events(events).build()
    }
}
