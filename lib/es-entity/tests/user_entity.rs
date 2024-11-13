use derive_builder::Builder;
use serde::{Deserialize, Serialize};

pub use es_entity::*;

es_entity::entity_id! { UserId, TermsTemplateId }

#[derive(EsEvent, Debug, Clone, Deserialize, Serialize)]
#[serde(tag = "type", rename_all = "snake_case")]
#[es_event(id = "UserId")]
pub enum UserEvent {
    Initialized { id: UserId, email: String },
    RoleAssigned {},
    RoleRevoked {},
    EmailUpdated { email: String },
    SomeOtherEvent {},
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

    #[builder(default)]
    #[es_entity(nested)]
    terms_templates: Nested<TermsTemplate>,
    events: EntityEvents<UserEvent>,
}

impl User {
    pub fn email(&self) -> &str {
        &self.email
    }

    pub fn update_email(&mut self, new_email: String) -> Idempotent<()> {
        idempotency_guard!(
            self.events.iter_all().rev(),
            UserEvent::EmailUpdated { email } if email == &new_email,
            UserEvent::SomeOtherEvent { .. },
        );
        Idempotent::Executed(())
    }

    pub fn new_template(&mut self) -> &NewTermsTemplate {
        self.terms_templates.add_new(
            NewTermsTemplate::builder()
                .id(TermsTemplateId::new())
                .name("New Template".to_string())
                .build()
                .expect("could not build"),
        )
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

#[derive(EsEvent, Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "snake_case")]
#[es_event(id = "TermsTemplateId")]
pub enum TermsTemplateEvent {
    Initialized { id: TermsTemplateId, name: String },
    TermValuesUpdated {},
}

#[derive(EsEntity, Builder)]
#[builder(pattern = "owned", build_fn(error = "EsEntityError"))]
pub struct TermsTemplate {
    pub id: TermsTemplateId,
    pub name: String,
    events: EntityEvents<TermsTemplateEvent>,
}

impl TryFromEvents<TermsTemplateEvent> for TermsTemplate {
    fn try_from_events(events: EntityEvents<TermsTemplateEvent>) -> Result<Self, EsEntityError> {
        let mut builder = TermsTemplateBuilder::default();

        for event in events.iter_all() {
            match event {
                TermsTemplateEvent::Initialized { id, name } => {
                    builder = builder.id(*id).name(name.clone());
                }
                TermsTemplateEvent::TermValuesUpdated {} => {}
            }
        }
        builder.events(events).build()
    }
}

#[derive(Builder)]
pub struct NewTermsTemplate {
    #[builder(setter(into))]
    pub id: TermsTemplateId,
    #[builder(setter(into))]
    pub name: String,
    pub user_id: UserId,
}

impl NewTermsTemplate {
    pub fn builder() -> NewTermsTemplateBuilder {
        NewTermsTemplateBuilder::default()
    }
}

impl IntoEvents<TermsTemplateEvent> for NewTermsTemplate {
    fn into_events(self) -> EntityEvents<TermsTemplateEvent> {
        EntityEvents::init(
            self.id,
            [TermsTemplateEvent::Initialized {
                id: self.id,
                name: self.name,
            }],
        )
    }
}
