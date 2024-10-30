use derive_builder::Builder;
use serde::{Deserialize, Serialize};

use std::collections::HashSet;

use audit::AuditInfo;
use es_entity::*;

use super::error::ApprovalProcessError;
use crate::{policy::ApprovalRules, primitives::*};

#[derive(EsEvent, Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "snake_case")]
#[es_event(id = "ApprovalProcessId")]
pub(crate) enum ApprovalProcessEvent {
    Initialized {
        id: ApprovalProcessId,
        policy_id: PolicyId,
        process_type: ApprovalProcessType,
        rules: ApprovalRules,
        target_ref: String,
        audit_info: AuditInfo,
    },
    Approved {
        approver_id: UserId,
        audit_info: AuditInfo,
    },
    Denied {
        denier_id: UserId,
        audit_info: AuditInfo,
    },
    Concluded {
        approved: bool,
        audit_info: AuditInfo,
    },
}

#[derive(EsEntity, Builder)]
#[builder(pattern = "owned", build_fn(error = "EsEntityError"))]
pub struct ApprovalProcess {
    pub id: ApprovalProcessId,
    pub process_type: ApprovalProcessType,
    pub policy_id: PolicyId,
    pub rules: ApprovalRules,
    pub(super) events: EntityEvents<ApprovalProcessEvent>,
}

impl ApprovalProcess {
    pub fn created_at(&self) -> chrono::DateTime<chrono::Utc> {
        self.events
            .entity_first_persisted_at()
            .expect("No events for committee")
    }

    pub fn user_voted_at(&self, user_id: UserId) -> Option<chrono::DateTime<chrono::Utc>> {
        self.events
            .iter_persisted()
            .filter_map(|event| match event.event {
                ApprovalProcessEvent::Approved { approver_id, .. } if approver_id == user_id => {
                    Some(event.recorded_at)
                }
                ApprovalProcessEvent::Denied { denier_id, .. } if denier_id == user_id => {
                    Some(event.recorded_at)
                }
                _ => None,
            })
            .next()
    }
    pub fn target_ref(&self) -> &str {
        if let ApprovalProcessEvent::Initialized { target_ref, .. } =
            self.events.iter_all().next().expect("No events")
        {
            target_ref
        } else {
            panic!("No events")
        }
    }

    pub fn committee_id(&self) -> Option<CommitteeId> {
        self.rules.committee_id()
    }

    pub fn can_user_vote(&self, user_id: UserId, eligible: HashSet<UserId>) -> bool {
        eligible.contains(&user_id)
            && !self.approvers().contains(&user_id)
            && !self.deniers().contains(&user_id)
    }

    pub(crate) fn check_concluded(
        &mut self,
        eligible: HashSet<UserId>,
        audit_info: AuditInfo,
    ) -> Option<bool> {
        if !self.status().is_concluded() {
            if let Some(approved) =
                self.rules
                    .is_approved_or_denied(&eligible, &self.approvers(), &self.deniers())
            {
                self.events.push(ApprovalProcessEvent::Concluded {
                    approved,
                    audit_info,
                });
                return Some(approved);
            }
        }
        None
    }

    pub fn status(&self) -> ApprovalProcessStatus {
        for event in self.events.iter_all().rev() {
            match event {
                ApprovalProcessEvent::Concluded { approved: true, .. } => {
                    return ApprovalProcessStatus::Approved
                }
                ApprovalProcessEvent::Concluded {
                    approved: false, ..
                } => return ApprovalProcessStatus::Denied,
                _ => {}
            }
        }
        ApprovalProcessStatus::InProgress
    }

    pub(crate) fn approve(
        &mut self,
        eligible_members: &HashSet<UserId>,
        approver_id: UserId,
        audit_info: AuditInfo,
    ) -> Result<(), ApprovalProcessError> {
        if self.status().is_concluded() {
            return Err(ApprovalProcessError::AlreadyConcluded);
        }

        if !eligible_members.contains(&approver_id) {
            return Err(ApprovalProcessError::NotEligible);
        }

        if self.approvers().contains(&approver_id) || self.deniers().contains(&approver_id) {
            return Err(ApprovalProcessError::AlreadyVoted);
        }

        self.events.push(ApprovalProcessEvent::Approved {
            approver_id,
            audit_info,
        });

        Ok(())
    }

    pub(crate) fn deny(
        &mut self,
        eligible_members: &HashSet<UserId>,
        denier_id: UserId,
        audit_info: AuditInfo,
    ) -> Result<(), ApprovalProcessError> {
        if self.status().is_concluded() {
            return Err(ApprovalProcessError::AlreadyConcluded);
        }

        if !eligible_members.contains(&denier_id) {
            return Err(ApprovalProcessError::NotEligible);
        }

        if self.approvers().contains(&denier_id) || self.deniers().contains(&denier_id) {
            return Err(ApprovalProcessError::AlreadyVoted);
        }

        self.events.push(ApprovalProcessEvent::Denied {
            denier_id,
            audit_info,
        });

        Ok(())
    }

    pub fn approvers(&self) -> HashSet<UserId> {
        self.events
            .iter_all()
            .filter_map(|event| match event {
                ApprovalProcessEvent::Approved { approver_id, .. } => Some(*approver_id),
                _ => None,
            })
            .collect()
    }

    pub fn deniers(&self) -> HashSet<UserId> {
        self.events
            .iter_all()
            .filter_map(|event| match event {
                ApprovalProcessEvent::Denied { denier_id, .. } => Some(*denier_id),
                _ => None,
            })
            .collect()
    }
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
                    rules,
                    ..
                } => {
                    builder = builder
                        .id(*id)
                        .process_type(process_type.clone())
                        .policy_id(*policy_id)
                        .rules(*rules);
                }
                ApprovalProcessEvent::Approved { .. } => {}
                ApprovalProcessEvent::Denied { .. } => {}
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
    pub(super) rules: ApprovalRules,
    #[builder(setter(into))]
    pub(super) target_ref: String,
    #[builder(setter(into))]
    pub audit_info: AuditInfo,
}

impl NewApprovalProcess {
    pub fn builder() -> NewApprovalProcessBuilder {
        NewApprovalProcessBuilder::default()
    }

    pub fn committee_id(&self) -> Option<CommitteeId> {
        self.rules.committee_id()
    }
}

impl IntoEvents<ApprovalProcessEvent> for NewApprovalProcess {
    fn into_events(self) -> EntityEvents<ApprovalProcessEvent> {
        EntityEvents::init(
            self.id,
            [ApprovalProcessEvent::Initialized {
                id: self.id,
                policy_id: self.policy_id,
                process_type: self.process_type,
                rules: self.rules,
                target_ref: self.target_ref,
                audit_info: self.audit_info,
            }],
        )
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use audit::{AuditEntryId, AuditInfo};

    fn dummy_audit_info() -> AuditInfo {
        AuditInfo {
            audit_entry_id: AuditEntryId::from(1),
            sub: "sub".to_string(),
        }
    }

    fn init_events(rules: ApprovalRules) -> EntityEvents<ApprovalProcessEvent> {
        EntityEvents::init(
            ApprovalProcessId::new(),
            [ApprovalProcessEvent::Initialized {
                id: ApprovalProcessId::new(),
                policy_id: PolicyId::new(),
                process_type: ApprovalProcessType::from_owned("type".to_string()),
                rules,
                target_ref: "target_ref".to_string(),
                audit_info: dummy_audit_info(),
            }],
        )
    }

    #[test]
    fn approve() {
        let mut process =
            ApprovalProcess::try_from_events(init_events(ApprovalRules::CommitteeThreshold {
                threshold: 2,
                committee_id: CommitteeId::new(),
            }))
            .expect("Could not build approval process");
        let approver = UserId::new();
        let audit_info = dummy_audit_info();
        let eligible = [approver].iter().copied().collect();
        assert!(process
            .approve(&eligible, approver, audit_info.clone())
            .is_ok());
        assert!(process.approvers().contains(&approver));
    }

    #[test]
    fn approve_not_eligible() {
        let mut process =
            ApprovalProcess::try_from_events(init_events(ApprovalRules::CommitteeThreshold {
                threshold: 2,
                committee_id: CommitteeId::new(),
            }))
            .expect("Could not build approval process");
        let approver = UserId::new();
        let audit_info = dummy_audit_info();
        assert!(matches!(
            process.approve(&HashSet::new(), approver, audit_info.clone()),
            Err(ApprovalProcessError::NotEligible)
        ));
        assert!(process.approvers().is_empty());
    }

    #[test]
    fn approve_already_voted() {
        let mut process =
            ApprovalProcess::try_from_events(init_events(ApprovalRules::CommitteeThreshold {
                threshold: 2,
                committee_id: CommitteeId::new(),
            }))
            .expect("Could not build approval process");
        let approver = UserId::new();
        let audit_info = dummy_audit_info();
        let eligible: HashSet<_> = [approver].iter().copied().collect();
        assert!(process
            .approve(&eligible, approver, audit_info.clone())
            .is_ok());
        assert!(matches!(
            process.approve(&eligible, approver, audit_info.clone()),
            Err(ApprovalProcessError::AlreadyVoted)
        ));
    }

    #[test]
    fn approve_already_concluded() {
        let mut process =
            ApprovalProcess::try_from_events(init_events(ApprovalRules::SystemAutoApprove))
                .expect("Could not build approval process");
        process.check_concluded(HashSet::new(), dummy_audit_info());
        let approver = UserId::new();
        let audit_info = dummy_audit_info();
        let eligible: HashSet<_> = [approver].iter().copied().collect();
        assert!(matches!(
            process.approve(&eligible, approver, audit_info.clone()),
            Err(ApprovalProcessError::AlreadyConcluded)
        ));
    }

    #[test]
    fn deny() {
        let mut process =
            ApprovalProcess::try_from_events(init_events(ApprovalRules::CommitteeThreshold {
                threshold: 2,
                committee_id: CommitteeId::new(),
            }))
            .expect("Could not build approval process");
        let denier = UserId::new();
        let audit_info = dummy_audit_info();
        let eligible = [denier].iter().copied().collect();
        assert!(process.deny(&eligible, denier, audit_info.clone()).is_ok());
        assert!(process.deniers().contains(&denier));
    }

    #[test]
    fn deny_not_eligible() {
        let mut process =
            ApprovalProcess::try_from_events(init_events(ApprovalRules::CommitteeThreshold {
                threshold: 2,
                committee_id: CommitteeId::new(),
            }))
            .expect("Could not build approval process");
        let denier = UserId::new();
        let audit_info = dummy_audit_info();
        assert!(matches!(
            process.deny(&HashSet::new(), denier, audit_info.clone()),
            Err(ApprovalProcessError::NotEligible)
        ));
        assert!(process.deniers().is_empty());
    }

    #[test]
    fn deny_already_voted() {
        let mut process =
            ApprovalProcess::try_from_events(init_events(ApprovalRules::CommitteeThreshold {
                threshold: 2,
                committee_id: CommitteeId::new(),
            }))
            .expect("Could not build approval process");
        let denier = UserId::new();
        let audit_info = dummy_audit_info();
        let eligible: HashSet<_> = [denier].iter().copied().collect();
        assert!(process
            .approve(&eligible, denier, audit_info.clone())
            .is_ok());
        assert!(matches!(
            process.deny(&eligible, denier, audit_info.clone()),
            Err(ApprovalProcessError::AlreadyVoted)
        ));
    }

    #[test]
    fn deny_already_concluded() {
        let mut process =
            ApprovalProcess::try_from_events(init_events(ApprovalRules::SystemAutoApprove))
                .expect("Could not build approval process");
        process.check_concluded(HashSet::new(), dummy_audit_info());
        let denier = UserId::new();
        let audit_info = dummy_audit_info();
        let eligible: HashSet<_> = [denier].iter().copied().collect();
        assert!(matches!(
            process.deny(&eligible, denier, audit_info.clone()),
            Err(ApprovalProcessError::AlreadyConcluded)
        ));
    }
}
