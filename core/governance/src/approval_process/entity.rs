use derive_builder::Builder;
use serde::{Deserialize, Serialize};

use audit::AuditInfo;
use es_entity::*;
use shared_primitives::{ApprovalProcessId, CommitteeId, PolicyId};

use crate::{ApprovalProcessType, ApprovalRules};

#[derive(EsEvent, Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "snake_case")]
#[es_event(id = "ApprovalProcessId")]
pub enum ApprovalProcessEvent {
    Initialized {
        id: ApprovalProcessId,
        policy_id: PolicyId,
        process_type: ApprovalProcessType,
        rules: ApprovalRules,
        committee_id: Option<CommitteeId>,
        audit_info: AuditInfo,
    },
    Concluded {
        approved: bool,
    },
}

#[derive(EsEntity, Builder)]
#[builder(pattern = "owned", build_fn(error = "EsEntityError"))]
pub struct ApprovalProcess {
    pub id: ApprovalProcessId,
    pub process_type: ApprovalProcessType,
    pub policy_id: PolicyId,
    pub committee_id: Option<CommitteeId>,
    pub(super) events: EntityEvents<ApprovalProcessEvent>,
}

impl TryFromEvents<ApprovalProcessEvent> for ApprovalProcess {
    fn try_from_events(events: EntityEvents<ApprovalProcessEvent>) -> Result<Self, EsEntityError> {
        let mut builder = ApprovalProcessBuilder::default();
        for event in events.iter_all() {
            match event {
                ApprovalProcessEvent::Initialized {
                    id,
                    process_type,
                    policy_id,
                    committee_id,
                    ..
                } => {
                    builder = builder
                        .id(*id)
                        .process_type(process_type.clone())
                        .policy_id(*policy_id)
                        .committee_id(*committee_id)
                }
                ApprovalProcessEvent::Concluded { .. } => {}
            }
        }
        builder.events(events).build()
    }
}

#[derive(Debug, Builder)]
pub(crate) struct NewApprovalProcess {
    #[builder(setter(into))]
    pub(super) id: ApprovalProcessId,
    pub(super) policy_id: PolicyId,
    pub(super) process_type: ApprovalProcessType,
    #[builder(default, setter(into))]
    pub(super) committee_id: Option<CommitteeId>,
    pub(super) rules: ApprovalRules,
    #[builder(setter(into))]
    pub audit_info: AuditInfo,
}

impl NewApprovalProcess {
    pub fn builder() -> NewApprovalProcessBuilder {
        NewApprovalProcessBuilder::default()
    }
}

impl IntoEvents<ApprovalProcessEvent> for NewApprovalProcess {
    fn into_events(self) -> EntityEvents<ApprovalProcessEvent> {
        let auto_approved = self.rules == ApprovalRules::Automatic;
        let mut events = vec![ApprovalProcessEvent::Initialized {
            id: self.id,
            policy_id: self.policy_id,
            process_type: self.process_type,
            rules: self.rules,
            committee_id: self.committee_id,
            audit_info: self.audit_info,
        }];
        if auto_approved {
            events.push(ApprovalProcessEvent::Concluded { approved: true });
        }
        EntityEvents::init(self.id, events)
    }
}
