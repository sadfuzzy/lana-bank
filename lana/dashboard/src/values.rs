use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

use core_money::{Satoshis, UsdCents};
use lana_events::*;

#[derive(Clone, Default, Serialize, Deserialize, Debug)]
pub struct DashboardValues {
    pub active_facilities: u32,
    pub pending_facilities: u32,
    pub total_disbursed: UsdCents,
    pub total_collateral: Satoshis,
    pub last_updated: DateTime<Utc>,
}

impl DashboardValues {
    pub(crate) fn process_event(&mut self, recorded_at: DateTime<Utc>, event: &LanaEvent) -> bool {
        self.last_updated = recorded_at;
        match event {
            LanaEvent::Credit(CreditEvent::FacilityCreated { .. }) => {
                self.pending_facilities += 1;
                true
            }
            LanaEvent::Credit(CreditEvent::FacilityActivated { .. }) => {
                self.pending_facilities -= 1;
                self.active_facilities += 1;
                true
            }
            LanaEvent::Credit(CreditEvent::FacilityCompleted { .. }) => {
                self.active_facilities -= 1;
                true
            }
            LanaEvent::Credit(CreditEvent::DisbursalExecuted { amount, .. }) => {
                self.total_disbursed += *amount;
                true
            }
            LanaEvent::Credit(CreditEvent::FacilityRepaymentRecorded {
                disbursal_amount, ..
            }) => {
                self.total_disbursed -= *disbursal_amount;
                true
            }
            LanaEvent::Credit(CreditEvent::FacilityCollateralUpdated {
                abs_diff,
                action: FacilityCollateralUpdateAction::Add,
                ..
            }) => {
                self.total_collateral += *abs_diff;
                true
            }
            LanaEvent::Credit(CreditEvent::FacilityCollateralUpdated {
                abs_diff,
                action: FacilityCollateralUpdateAction::Remove,
                ..
            }) => {
                self.total_collateral -= *abs_diff;
                true
            }
            _ => false,
        }
    }
}
