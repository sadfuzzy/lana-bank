use crate::CoreCreditEvent;

use super::entry::*;

#[derive(Default, serde::Deserialize, serde::Serialize)]
pub struct CreditFacilityHistory {
    history: Vec<CreditFacilityHistoryEntry>,
}

impl CreditFacilityHistory {
    pub fn process_event(&mut self, event: &CoreCreditEvent) {
        use CoreCreditEvent::*;

        match event {
            FacilityCreated { amount, .. } => {
                self.history.push(CreditFacilityHistoryEntry::Creation(
                    CreditFacilityCreated { cents: *amount },
                ));
            }
            FacilityApproved { .. } => {}
            FacilityActivated {
                activation_tx_id,
                activated_at,
                ..
            } => {
                self.history.push(CreditFacilityHistoryEntry::Origination(
                    CreditFacilityOrigination {
                        recorded_at: *activated_at,
                        tx_id: *activation_tx_id,
                    },
                ));
            }
            FacilityCollateralUpdated {
                abs_diff,
                recorded_at,
                action,
                ledger_tx_id,
                ..
            } => {
                self.history
                    .push(CreditFacilityHistoryEntry::Collateral(CollateralUpdated {
                        satoshis: *abs_diff,
                        recorded_at: *recorded_at,
                        action: *action,
                        tx_id: *ledger_tx_id,
                    }));
            }
            FacilityCollateralizationChanged {
                state,
                recorded_at,
                outstanding,
                price,
                ..
            } => {
                self.history
                    .push(CreditFacilityHistoryEntry::Collateralization(
                        CollateralizationUpdated {
                            state: *state,
                            outstanding_interest: outstanding.interest,
                            outstanding_disbursal: outstanding.disbursed,
                            recorded_at: *recorded_at,
                            price: *price,
                        },
                    ));
            }
            FacilityRepaymentRecorded {
                payment_id,
                disbursal_amount,
                interest_amount,
                recorded_at,
                ..
            } => {
                self.history
                    .push(CreditFacilityHistoryEntry::Payment(IncrementalPayment {
                        recorded_at: *recorded_at,
                        cents: *disbursal_amount + *interest_amount,
                        payment_id: *payment_id,
                    }));
            }
            DisbursalSettled {
                amount,
                recorded_at,
                ledger_tx_id,
                ..
            } => {
                self.history
                    .push(CreditFacilityHistoryEntry::Disbursal(DisbursalExecuted {
                        cents: *amount,
                        recorded_at: *recorded_at,
                        tx_id: *ledger_tx_id,
                    }));
            }
            AccrualPosted {
                amount,
                posted_at,
                ledger_tx_id,
                days_in_cycle,
                ..
            } => {
                self.history.push(CreditFacilityHistoryEntry::Interest(
                    InterestAccrualsPosted {
                        cents: *amount,
                        recorded_at: *posted_at,
                        tx_id: *ledger_tx_id,
                        days: *days_in_cycle,
                    },
                ));
            }
            FacilityCompleted { completed_at, .. } => {
                self.history.push(CreditFacilityHistoryEntry::Completion(
                    CreditFacilityCompleted {
                        completed_at: *completed_at,
                    },
                ));
            }
            ObligationCreated { .. } => {}
            ObligationDue { .. } => {}
        }
    }
}
