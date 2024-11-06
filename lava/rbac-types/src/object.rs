use std::{fmt::Display, str::FromStr};

use authz::AllOrOne;
use core_user::UserObject;
use dashboard::DashboardModuleObject;
use governance::GovernanceObject;
use lava_ids::CustomerId;

#[derive(Clone, Copy, Debug, PartialEq, strum::EnumDiscriminants)]
#[strum_discriminants(derive(strum::Display, strum::EnumString))]
#[strum_discriminants(strum(serialize_all = "kebab-case"))]
pub enum LavaObject {
    App(AppObject),
    Governance(GovernanceObject),
    User(UserObject),
    Dashboard(DashboardModuleObject),
}

impl From<AppObject> for LavaObject {
    fn from(object: AppObject) -> Self {
        LavaObject::App(object)
    }
}
impl From<DashboardModuleObject> for LavaObject {
    fn from(object: DashboardModuleObject) -> Self {
        LavaObject::Dashboard(object)
    }
}
impl From<GovernanceObject> for LavaObject {
    fn from(action: GovernanceObject) -> Self {
        LavaObject::Governance(action)
    }
}
impl From<UserObject> for LavaObject {
    fn from(action: UserObject) -> Self {
        LavaObject::User(action)
    }
}

impl Display for LavaObject {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}/", LavaObjectDiscriminants::from(self))?;
        use LavaObject::*;
        match self {
            App(action) => action.fmt(f),
            Governance(action) => action.fmt(f),
            User(action) => action.fmt(f),
            Dashboard(action) => action.fmt(f),
        }
    }
}

impl FromStr for LavaObject {
    type Err = &'static str;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        let (module, object) = s.split_once('/').expect("missing colon");
        use LavaObjectDiscriminants::*;
        let res = match module.parse().expect("invalid module") {
            App => LavaObject::from(object.parse::<AppObject>()?),
            Governance => LavaObject::from(object.parse::<GovernanceObject>()?),
            User => LavaObject::from(object.parse::<UserObject>()?),
            Dashboard => LavaObject::from(
                object
                    .parse::<DashboardModuleObject>()
                    .map_err(|_| "could not parse DashboardModuleObject")?,
            ),
        };
        Ok(res)
    }
}

#[derive(Clone, Copy, Debug, PartialEq, strum::EnumDiscriminants)]
#[strum_discriminants(derive(strum::Display, strum::EnumString))]
#[strum_discriminants(strum(serialize_all = "kebab-case"))]
pub enum AppObject {
    Applicant,
    TermsTemplate,
    Customer(CustomerAllOrOne),
    Document,
    Deposit,
    Withdrawal,
    Report,
    Audit,
    Ledger,
    CreditFacility,
}

impl Display for AppObject {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        let discriminant = AppObjectDiscriminants::from(self);
        use AppObject::*;
        match self {
            Customer(customer_ref) => {
                write!(f, "{}/{}", discriminant, customer_ref)
            }
            _ => write!(f, "{}", discriminant),
        }
    }
}

impl FromStr for AppObject {
    type Err = &'static str;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        let mut elems = s.split('/');
        let entity = elems.next().expect("missing first element");
        use AppObjectDiscriminants::*;
        let res = match entity.parse().expect("invalid entity") {
            Applicant => AppObject::Applicant,
            TermsTemplate => AppObject::TermsTemplate,
            Customer => {
                let customer_ref = elems
                    .next()
                    .ok_or("could not parse AppObject")?
                    .parse()
                    .map_err(|_| "could not parse AppObject")?;
                AppObject::Customer(customer_ref)
            }
            Deposit => AppObject::Deposit,
            Withdrawal => AppObject::Withdrawal,
            Report => AppObject::Report,
            Audit => AppObject::Audit,
            Ledger => AppObject::Ledger,
            CreditFacility => AppObject::CreditFacility,
            Document => AppObject::Document,
        };
        Ok(res)
    }
}

pub type CustomerAllOrOne = AllOrOne<CustomerId>;

#[cfg(test)]
mod test {
    use super::*;

    fn test_to_and_from_string(action: LavaObject, result: &str) -> anyhow::Result<()> {
        let action_str = action.to_string();
        assert_eq!(&action_str, result);

        let parsed_action: LavaObject = action_str.parse().expect("could not parse action");
        assert_eq!(parsed_action, action);

        Ok(())
    }

    #[test]
    fn action_serialization() -> anyhow::Result<()> {
        // App
        test_to_and_from_string(
            LavaObject::App(AppObject::Customer(AllOrOne::All)),
            "app/customer/*",
        )?;

        // Governance
        test_to_and_from_string(
            LavaObject::Governance(GovernanceObject::Committee(AllOrOne::All)),
            "governance/committee/*",
        )?;

        Ok(())
    }
}
