use derive_builder::Builder;
use serde::{Deserialize, Serialize};

pub use es_entity::*;

es_entity::entity_id! { UserId }

#[derive(EsEvent, Debug, Clone, Deserialize, Serialize)]
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

impl User {
    pub fn email(&self) -> &str {
        &self.email
    }
}

impl TryFromEvents<UserEvent> for User {
    fn try_from_events(events: EntityEvents<UserEvent>) -> Result<Self, EsEntityError> {
        let mut builder = UserBuilder::default();
        for event in events.iter_all() {
            if let UserEvent::Initialized { id, email } = event {
                builder = builder.id(*id).email(email.clone())
            }
        }
        builder.events(events).build()
    }
}
