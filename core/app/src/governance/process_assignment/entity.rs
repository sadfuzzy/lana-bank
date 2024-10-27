use derive_builder::Builder;
use serde::{Deserialize, Serialize};

use es_entity::*;

use crate::primitives::{ApprovalProcessType, AuditInfo, CommitteeId, ProcessAssignmentId};

#[derive(EsEvent, Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "snake_case")]
#[es_event(id = "ProcessAssignmentId")]
pub enum ProcessAssignmentEvent {
    Initialized {
        id: ProcessAssignmentId,
        approval_process_type: ApprovalProcessType,
        audit_info: AuditInfo,
    },
    CommitteeUpdated {
        committee_id: CommitteeId,
        audit_info: AuditInfo,
    },
}

#[derive(EsEntity, Builder)]
#[builder(pattern = "owned", build_fn(error = "EsEntityError"))]
pub struct ProcessAssignment {
    pub id: ProcessAssignmentId,
    pub approval_process_type: ApprovalProcessType,
    #[builder(default, setter(strip_option))]
    pub committee_id: Option<CommitteeId>,
    pub(super) events: EntityEvents<ProcessAssignmentEvent>,
}

impl ProcessAssignment {
    pub fn created_at(&self) -> chrono::DateTime<chrono::Utc> {
        self.events
            .entity_first_persisted_at()
            .expect("No events for process assignment")
    }

    pub fn update_committee(&mut self, committee_id: CommitteeId, audit_info: AuditInfo) {
        if self.committee_id == Some(committee_id) {
            return;
        }

        self.events.push(ProcessAssignmentEvent::CommitteeUpdated {
            committee_id,
            audit_info,
        });

        self.committee_id = Some(committee_id);
    }
}

impl TryFromEvents<ProcessAssignmentEvent> for ProcessAssignment {
    fn try_from_events(
        events: EntityEvents<ProcessAssignmentEvent>,
    ) -> Result<Self, EsEntityError> {
        let mut builder = ProcessAssignmentBuilder::default();
        for event in events.iter_all() {
            match event {
                ProcessAssignmentEvent::Initialized {
                    id,
                    approval_process_type,
                    ..
                } => {
                    builder = builder
                        .id(*id)
                        .approval_process_type(*approval_process_type)
                }
                ProcessAssignmentEvent::CommitteeUpdated { committee_id, .. } => {
                    builder = builder.committee_id(*committee_id)
                }
            }
        }
        builder.events(events).build()
    }
}

#[derive(Debug, Builder)]
pub struct NewProcessAssignment {
    #[builder(setter(into))]
    pub(super) id: ProcessAssignmentId,
    #[builder(setter(into))]
    pub(super) approval_process_type: ApprovalProcessType,
    #[builder(setter(into))]
    pub audit_info: AuditInfo,
}

impl NewProcessAssignment {
    pub fn builder() -> NewProcessAssignmentBuilder {
        NewProcessAssignmentBuilder::default()
    }
}

impl IntoEvents<ProcessAssignmentEvent> for NewProcessAssignment {
    fn into_events(self) -> EntityEvents<ProcessAssignmentEvent> {
        EntityEvents::init(
            self.id,
            [ProcessAssignmentEvent::Initialized {
                id: self.id,
                approval_process_type: self.approval_process_type,
                audit_info: self.audit_info,
            }],
        )
    }
}
