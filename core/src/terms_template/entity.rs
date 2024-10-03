use derive_builder::Builder;
use serde::{Deserialize, Serialize};

use crate::{entity::*, primitives::*, terms::TermValues};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum TermsTemplateEvent {
    Initialized {
        id: TermsTemplateId,
        name: String,
        values: TermValues,
        audit_info: AuditInfo,
    },
    TermValuesUpdated {
        values: TermValues,
        audit_info: AuditInfo,
    },
}

impl EntityEvent for TermsTemplateEvent {
    type EntityId = TermsTemplateId;
    fn event_table_name() -> &'static str {
        "terms_template_events"
    }
}

#[derive(Builder)]
#[builder(pattern = "owned", build_fn(error = "EntityError"))]
pub struct TermsTemplate {
    pub id: TermsTemplateId,
    pub name: String,
    pub values: TermValues,
    pub(super) events: EntityEvents<TermsTemplateEvent>,
}

impl Entity for TermsTemplate {
    type Event = TermsTemplateEvent;
}

impl TermsTemplate {
    pub fn created_at(&self) -> chrono::DateTime<chrono::Utc> {
        self.events
            .entity_first_persisted_at
            .expect("No events for terms template")
    }

    pub fn update_values(&mut self, new_values: TermValues, audit_info: AuditInfo) {
        self.events.push(TermsTemplateEvent::TermValuesUpdated {
            values: new_values,
            audit_info,
        });
        self.values = new_values;
    }
}

impl TryFrom<EntityEvents<TermsTemplateEvent>> for TermsTemplate {
    type Error = EntityError;

    fn try_from(events: EntityEvents<TermsTemplateEvent>) -> Result<Self, Self::Error> {
        let mut builder = TermsTemplateBuilder::default();

        for event in events.iter() {
            match event {
                TermsTemplateEvent::Initialized {
                    id, name, values, ..
                } => {
                    builder = builder.id(*id).name(name.clone()).values(*values);
                }
                TermsTemplateEvent::TermValuesUpdated { values, .. } => {
                    builder = builder.values(*values);
                }
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
    #[builder(setter(into))]
    pub values: TermValues,
    #[builder(setter(into))]
    pub audit_info: AuditInfo,
}

impl NewTermsTemplate {
    pub fn builder() -> NewTermsTemplateBuilder {
        NewTermsTemplateBuilder::default()
    }

    pub(super) fn initial_events(self) -> EntityEvents<TermsTemplateEvent> {
        EntityEvents::init(
            self.id,
            [TermsTemplateEvent::Initialized {
                id: self.id,
                name: self.name,
                values: self.values,
                audit_info: self.audit_info,
            }],
        )
    }
}
