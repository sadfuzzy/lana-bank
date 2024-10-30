use serde::{Deserialize, Serialize};

use std::collections::HashSet;

use shared_primitives::CommitteeId;

#[derive(Debug, Clone, Copy, PartialEq, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum ApprovalRules {
    CommitteeThreshold {
        committee_id: CommitteeId,
        threshold: usize,
    },
    SystemAutoApprove,
}

impl ApprovalRules {
    pub fn committee_id(&self) -> Option<CommitteeId> {
        match self {
            ApprovalRules::CommitteeThreshold { committee_id, .. } => Some(*committee_id),
            ApprovalRules::SystemAutoApprove => None,
        }
    }

    pub fn is_approved_or_denied<Id: Eq + std::hash::Hash>(
        &self,
        eligible_members: &HashSet<Id>,
        approving_members: &HashSet<Id>,
        denying_members: &HashSet<Id>,
    ) -> Option<bool> {
        match self {
            ApprovalRules::SystemAutoApprove => Some(true),
            ApprovalRules::CommitteeThreshold { threshold, .. } => {
                let approved_eligible = eligible_members.intersection(approving_members).count();
                if approved_eligible >= *threshold {
                    return Some(true);
                }

                let denied_eligible = eligible_members.intersection(denying_members).count();
                let remaining_eligible = eligible_members.len() - denied_eligible;
                if remaining_eligible < *threshold {
                    return Some(false);
                }

                None
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn make_set(ids: &[u32]) -> HashSet<u32> {
        ids.iter().copied().collect()
    }

    #[test]
    fn test_committee_threshold_approval() {
        let rules = ApprovalRules::CommitteeThreshold {
            threshold: 3,
            committee_id: CommitteeId::new(),
        };

        let eligible = make_set(&[1, 2, 3, 4, 5]);
        let approving = make_set(&[1, 2, 3, 4]);
        let denying = make_set(&[5]);

        let result = rules.is_approved_or_denied(&eligible, &approving, &denying);

        assert_eq!(
            result,
            Some(true),
            "Should be approved with 4 approvals >= threshold of 3"
        );
        assert_eq!(
            eligible.intersection(&approving).count(),
            4,
            "Should have 4 overlapping approved members"
        );
    }

    #[test]
    fn test_committee_threshold_denial() {
        let rules = ApprovalRules::CommitteeThreshold {
            threshold: 3,
            committee_id: CommitteeId::new(),
        };

        let eligible = make_set(&[1, 2, 3, 4, 5]);
        let approving = make_set(&[1]);
        let denying = make_set(&[2, 3, 4, 5]);

        let result = rules.is_approved_or_denied(&eligible, &approving, &denying);

        assert_eq!(
            result,
            Some(false),
            "Should be denied with only 1 non-denied member < threshold of 3"
        );
        assert_eq!(
            eligible.len() - eligible.intersection(&denying).count(),
            1,
            "Should have 1 non-denied eligible member"
        );
    }

    #[test]
    fn test_committee_threshold_pending() {
        let rules = ApprovalRules::CommitteeThreshold {
            threshold: 3,
            committee_id: CommitteeId::new(),
        };

        let eligible = make_set(&[1, 2, 3, 4, 5]);
        let approving = make_set(&[1, 2]);
        let denying = make_set(&[5]);

        let result = rules.is_approved_or_denied(&eligible, &approving, &denying);

        assert_eq!(
            result, None,
            "Should be pending when neither condition is met"
        );
        assert!(
            eligible.intersection(&approving).count() < 3,
            "Should have fewer than threshold approved members"
        );
        assert!(
            eligible.len() - eligible.intersection(&denying).count() > 2,
            "Should have more than threshold non-denied members"
        );
    }

    #[test]
    fn test_automatic() {
        let rules = ApprovalRules::SystemAutoApprove;

        assert_eq!(
            rules.is_approved_or_denied(&make_set(&[1, 2, 3]), &HashSet::new(), &HashSet::new()),
            Some(true),
            "Automatic rules should always approve regardless of inputs"
        );
    }

    #[test]
    fn test_edge_cases() {
        let rules = ApprovalRules::CommitteeThreshold {
            threshold: 3,
            committee_id: CommitteeId::new(),
        };

        // Empty sets
        let empty = HashSet::new();
        assert_eq!(
            rules.is_approved_or_denied(&empty, &empty, &empty),
            Some(false),
            "Empty eligible set should result in denial"
        );

        // Threshold larger than eligible set
        let small_eligible = make_set(&[1, 2]);
        assert_eq!(
            rules.is_approved_or_denied(&small_eligible, &empty, &empty),
            Some(false),
            "Should be denied when threshold exceeds eligible set size"
        );
    }
}
