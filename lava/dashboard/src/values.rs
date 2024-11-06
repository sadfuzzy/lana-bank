use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

use lava_events::*;

#[derive(Clone, Default, Serialize, Deserialize, Debug)]
pub struct DashboardValues {
    pub active_facilities: u32,
    pub pending_facilities: u32,
    pub last_updated: DateTime<Utc>,
}

impl DashboardValues {
    pub(crate) fn process_event(&mut self, recorded_at: DateTime<Utc>, event: &LavaEvent) -> bool {
        self.last_updated = recorded_at;
        match event {
            LavaEvent::Credit(CreditEvent::CreditFacilityCreated { .. }) => {
                self.pending_facilities += 1;
                true
            }
            _ => false,
        }
    }
}
