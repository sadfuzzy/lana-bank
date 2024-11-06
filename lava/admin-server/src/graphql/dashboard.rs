use async_graphql::*;

use lava_app::dashboard::DashboardValues;

#[derive(SimpleObject)]
pub struct Dashboard {
    active_facilities: u32,
    pending_facilities: u32,
}

impl From<DashboardValues> for Dashboard {
    fn from(values: DashboardValues) -> Self {
        Dashboard {
            active_facilities: values.active_facilities,
            pending_facilities: values.pending_facilities,
        }
    }
}
