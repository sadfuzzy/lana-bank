use serde::{Deserialize, Serialize};
use std::{borrow::Cow, fmt::Display, str::FromStr};

pub use shared_primitives::{AllOrOne, ApprovalProcessId, CommitteeId, PolicyId, UserId};

#[derive(Clone, Eq, Hash, PartialEq, Debug, Serialize, Deserialize, sqlx::Type)]
#[sqlx(transparent)]
#[serde(transparent)]
pub struct ApprovalProcessType(Cow<'static, str>);
impl ApprovalProcessType {
    pub const fn new(job_type: &'static str) -> Self {
        ApprovalProcessType(Cow::Borrowed(job_type))
    }

    #[cfg(test)]
    pub(crate) fn from_owned(job_type: String) -> Self {
        ApprovalProcessType(Cow::Owned(job_type))
    }
}

impl Display for ApprovalProcessType {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        self.0.fmt(f)
    }
}

#[derive(Clone, Copy, Debug, PartialEq, strum::EnumDiscriminants)]
#[strum_discriminants(derive(strum::Display, strum::EnumString))]
#[strum_discriminants(strum(serialize_all = "kebab-case"))]
pub enum GovernanceAction {
    Committee(CommitteeAction),
    Policy(PolicyAction),
    ApprovalProcess(ApprovalProcessAction),
}

impl Display for GovernanceAction {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}:", GovernanceActionDiscriminants::from(self))?;
        use GovernanceAction::*;
        match self {
            Committee(action) => action.fmt(f),
            Policy(action) => action.fmt(f),
            ApprovalProcess(action) => action.fmt(f),
        }
    }
}

impl FromStr for GovernanceAction {
    type Err = strum::ParseError;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        let (entity, action) = s.split_once(':').expect("missing colon");
        use GovernanceActionDiscriminants::*;
        let res = match entity.parse()? {
            Committee => GovernanceAction::from(action.parse::<CommitteeAction>()?),
            Policy => GovernanceAction::from(action.parse::<PolicyAction>()?),
            ApprovalProcess => GovernanceAction::from(action.parse::<ApprovalProcessAction>()?),
        };
        Ok(res)
    }
}

#[derive(PartialEq, Clone, Copy, Debug, strum::Display, strum::EnumString)]
#[strum(serialize_all = "kebab-case")]
pub enum CommitteeAction {
    Create,
    AddUser,
    RemoveUser,
    Read,
    List,
}

#[derive(PartialEq, Clone, Copy, Debug, strum::Display, strum::EnumString)]
#[strum(serialize_all = "kebab-case")]
pub enum PolicyAction {
    Create,
}

#[derive(PartialEq, Clone, Copy, Debug, strum::Display, strum::EnumString)]
#[strum(serialize_all = "kebab-case")]
pub enum ApprovalProcessAction {
    Create,
    Read,
    List,
    Approve,
    Deny,
    Conclude,
}

pub type CommitteeAllOrOne = AllOrOne<CommitteeId>;
pub type PolicyAllOrOne = AllOrOne<PolicyId>;
pub type ApprovalProcessAllOrOne = AllOrOne<ApprovalProcessId>;

#[derive(Clone, Copy, Debug, PartialEq, strum::EnumDiscriminants)]
#[strum_discriminants(derive(strum::Display, strum::EnumString))]
#[strum_discriminants(strum(serialize_all = "kebab-case"))]
pub enum GovernanceObject {
    Committee(CommitteeAllOrOne),
    Policy(PolicyAllOrOne),
    ApprovalProcess(ApprovalProcessAllOrOne),
}

impl Display for GovernanceObject {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        let discriminant = GovernanceObjectDiscriminants::from(self);
        use GovernanceObject::*;
        match self {
            Committee(obj_ref) => write!(f, "{}/{}", discriminant, obj_ref),
            Policy(obj_ref) => write!(f, "{}/{}", discriminant, obj_ref),
            ApprovalProcess(obj_ref) => write!(f, "{}/{}", discriminant, obj_ref),
        }
    }
}

impl FromStr for GovernanceObject {
    type Err = &'static str;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        let (entity, id) = s.split_once('/').expect("missing slash");
        use GovernanceObjectDiscriminants::*;
        let res = match entity.parse().expect("invalid entity") {
            Committee => {
                let obj_ref = id.parse().map_err(|_| "could not parse GovernanceObject")?;
                GovernanceObject::Committee(obj_ref)
            }
            Policy => {
                let obj_ref = id.parse().map_err(|_| "could not parse GovernanceObject")?;
                GovernanceObject::Policy(obj_ref)
            }
            ApprovalProcess => {
                let obj_ref = id.parse().map_err(|_| "could not parse GovernanceObject")?;
                GovernanceObject::ApprovalProcess(obj_ref)
            }
        };
        Ok(res)
    }
}

impl From<CommitteeAction> for GovernanceAction {
    fn from(action: CommitteeAction) -> Self {
        GovernanceAction::Committee(action)
    }
}

impl From<PolicyAction> for GovernanceAction {
    fn from(action: PolicyAction) -> Self {
        GovernanceAction::Policy(action)
    }
}

impl From<ApprovalProcessAction> for GovernanceAction {
    fn from(action: ApprovalProcessAction) -> Self {
        GovernanceAction::ApprovalProcess(action)
    }
}
