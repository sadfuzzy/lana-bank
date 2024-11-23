use std::{fmt::Display, str::FromStr};

#[derive(Clone, Copy, Debug, PartialEq, strum::EnumDiscriminants)]
#[strum_discriminants(derive(strum::Display, strum::EnumString))]
#[strum_discriminants(strum(serialize_all = "kebab-case"))]
pub enum DashboardModuleAction {
    Dashboard(DashboardAction),
}

impl DashboardModuleAction {
    pub const DASHBOARD_READ: Self = DashboardModuleAction::Dashboard(DashboardAction::Read);
}

impl Display for DashboardModuleAction {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}:", DashboardModuleActionDiscriminants::from(self))?;
        use DashboardModuleAction::*;
        match self {
            Dashboard(action) => action.fmt(f),
        }
    }
}

impl FromStr for DashboardModuleAction {
    type Err = strum::ParseError;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        let (entity, action) = s.split_once(':').expect("missing colon");
        use DashboardModuleActionDiscriminants::*;
        let res = match entity.parse()? {
            Dashboard => action.parse::<DashboardAction>()?,
        };
        Ok(res.into())
    }
}

#[derive(PartialEq, Clone, Copy, Debug, strum::Display, strum::EnumString)]
#[strum(serialize_all = "kebab-case")]
pub enum DashboardAction {
    Read,
}

#[derive(PartialEq, Clone, Copy, Debug, strum::Display, strum::EnumString)]
#[strum(serialize_all = "kebab-case")]
pub enum DashboardModuleObject {
    Dashboard,
}

impl From<DashboardAction> for DashboardModuleAction {
    fn from(action: DashboardAction) -> Self {
        DashboardModuleAction::Dashboard(action)
    }
}
