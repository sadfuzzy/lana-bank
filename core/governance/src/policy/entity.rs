use derive_builder::Builder;
use serde::{Deserialize, Serialize};

use audit::AuditInfo;
use es_entity::*;

use super::rules::ApprovalRules;
use crate::{approval_process::NewApprovalProcess, primitives::*};

#[derive(EsEvent, Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "snake_case")]
#[es_event(id = "PolicyId")]
pub enum PolicyEvent {
    Initialized {
        id: PolicyId,
        process_type: ApprovalProcessType,
        rules: ApprovalRules,
        committee_id: Option<CommitteeId>,
        audit_info: AuditInfo,
    },
}

#[derive(EsEntity, Builder)]
#[builder(pattern = "owned", build_fn(error = "EsEntityError"))]
pub struct Policy {
    pub id: PolicyId,
    pub process_type: ApprovalProcessType,
    #[builder(default)]
    pub committee_id: Option<CommitteeId>,
    pub rules: ApprovalRules,
    pub(super) events: EntityEvents<PolicyEvent>,
}

impl Policy {
    pub(crate) fn spawn_process(
        &self,
        id: ApprovalProcessId,
        audit_info: AuditInfo,
    ) -> NewApprovalProcess {
        NewApprovalProcess::builder()
            .id(id)
            .policy_id(self.id)
            .process_type(self.process_type.clone())
            .rules(self.rules.clone())
            .audit_info(audit_info)
            .build()
            .expect("failed to build new approval process")
    }
}

impl TryFromEvents<PolicyEvent> for Policy {
    fn try_from_events(events: EntityEvents<PolicyEvent>) -> Result<Self, EsEntityError> {
        let mut builder = PolicyBuilder::default();
        for event in events.iter_all() {
            match event {
                PolicyEvent::Initialized {
                    id,
                    process_type,
                    rules,
                    ..
                } => {
                    builder = builder
                        .id(*id)
                        .process_type(process_type.clone())
                        .rules(rules.clone())
                }
            }
        }
        builder.events(events).build()
    }
}

#[derive(Debug, Builder)]
pub struct NewPolicy {
    #[builder(setter(into))]
    pub(super) id: PolicyId,
    pub(super) process_type: ApprovalProcessType,
    #[builder(default, setter(into))]
    pub(super) committee_id: Option<CommitteeId>,
    pub(super) rules: ApprovalRules,
    #[builder(setter(into))]
    pub audit_info: AuditInfo,
}

impl NewPolicy {
    pub fn builder() -> NewPolicyBuilder {
        NewPolicyBuilder::default()
    }
}

impl IntoEvents<PolicyEvent> for NewPolicy {
    fn into_events(self) -> EntityEvents<PolicyEvent> {
        EntityEvents::init(
            self.id,
            [PolicyEvent::Initialized {
                id: self.id,
                process_type: self.process_type,
                rules: self.rules,
                committee_id: self.committee_id,
                audit_info: self.audit_info,
            }],
        )
    }
}
