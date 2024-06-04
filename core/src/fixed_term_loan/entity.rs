use chrono::{DateTime, Utc};
use derive_builder::Builder;
use serde::{Deserialize, Serialize};

use super::{error::*, terms::*};
use crate::{entity::*, ledger::fixed_term_loan::FixedTermLoanAccountIds, primitives::*};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum FixedTermLoanEvent {
    Initialized {
        id: FixedTermLoanId,
        user_id: UserId,
        account_ids: FixedTermLoanAccountIds,
        terms: FixedTermLoanTerms,
    },
    Approved {
        tx_id: LedgerTxId,
        collateral: Satoshis,
        principal: UsdCents,
    },
    InterestRecorded {
        tx_id: LedgerTxId,
        tx_ref: String,
    },
    PaymentRecorded {
        tx_id: LedgerTxId,
        tx_ref: String,
        amount: UsdCents,
    },
    Completed {
        tx_id: LedgerTxId,
        tx_ref: String,
        amount: UsdCents,
    },
}

impl EntityEvent for FixedTermLoanEvent {
    type EntityId = FixedTermLoanId;
    fn event_table_name() -> &'static str {
        "fixed_term_loan_events"
    }
}

#[derive(Builder)]
#[builder(pattern = "owned", build_fn(error = "EntityError"))]
pub struct FixedTermLoan {
    pub id: FixedTermLoanId,
    pub user_id: UserId,
    pub account_ids: FixedTermLoanAccountIds,
    pub terms: FixedTermLoanTerms,
    pub(super) events: EntityEvents<FixedTermLoanEvent>,
}

impl FixedTermLoan {
    pub fn approve(
        &mut self,
        tx_id: LedgerTxId,
        collateral: Satoshis,
        principal: UsdCents,
    ) -> Result<(), FixedTermLoanError> {
        for event in self.events.iter() {
            if let FixedTermLoanEvent::Approved { .. } = event {
                return Err(FixedTermLoanError::AlreadyApproved);
            }
        }

        self.events.push(FixedTermLoanEvent::Approved {
            tx_id,
            collateral,
            principal,
        });
        Ok(())
    }

    pub fn record_incur_interest_transaction(
        &mut self,
        tx_id: LedgerTxId,
    ) -> Result<String, FixedTermLoanError> {
        if self.is_completed() {
            return Err(FixedTermLoanError::AlreadyCompleted);
        }

        let tx_ref = format!(
            "{}-interest-{}",
            self.id,
            self.count_interest_incurred() + 1
        );
        self.events.push(FixedTermLoanEvent::InterestRecorded {
            tx_id,
            tx_ref: tx_ref.clone(),
        });
        Ok(tx_ref)
    }

    pub fn record_if_not_exceeding_outstanding(
        &mut self,
        tx_id: LedgerTxId,
        outstanding: UsdCents,
        record_amount: UsdCents,
    ) -> Result<String, FixedTermLoanError> {
        for event in self.events.iter() {
            if let FixedTermLoanEvent::Completed { .. } = event {
                return Err(FixedTermLoanError::AlreadyCompleted);
            }
        }

        if outstanding < record_amount {
            return Err(FixedTermLoanError::PaymentExceedsOutstandingLoanAmount(
                record_amount,
                outstanding,
            ));
        }

        let tx_ref = format!("{}-payment-{}", self.id, self.count_payment_made() + 1);
        self.events.push(FixedTermLoanEvent::PaymentRecorded {
            tx_id,
            tx_ref: tx_ref.clone(),
            amount: record_amount,
        });
        if outstanding == record_amount {
            self.events.push(FixedTermLoanEvent::Completed {
                tx_id,
                tx_ref: tx_ref.clone(),
                amount: record_amount,
            });
        }
        Ok(tx_ref)
    }

    fn count_interest_incurred(&self) -> usize {
        self.events
            .iter()
            .filter(|event| matches!(event, FixedTermLoanEvent::InterestRecorded { .. }))
            .count()
    }

    pub fn next_interest_at(&self) -> Option<DateTime<Utc>> {
        if !self.is_completed() && self.count_interest_incurred() <= 1 {
            Some(Utc::now())
        } else {
            None
        }
    }

    fn count_payment_made(&self) -> usize {
        self.events
            .iter()
            .filter(|event| matches!(event, FixedTermLoanEvent::PaymentRecorded { .. }))
            .count()
    }

    pub fn is_completed(&self) -> bool {
        self.events
            .iter()
            .filter(|event| matches!(event, FixedTermLoanEvent::Completed { .. }))
            .count()
            > 0
    }
}

impl Entity for FixedTermLoan {
    type Event = FixedTermLoanEvent;
}

impl TryFrom<EntityEvents<FixedTermLoanEvent>> for FixedTermLoan {
    type Error = EntityError;

    fn try_from(events: EntityEvents<FixedTermLoanEvent>) -> Result<Self, Self::Error> {
        let mut builder = FixedTermLoanBuilder::default();
        for event in events.iter() {
            match event {
                FixedTermLoanEvent::Initialized {
                    id,
                    user_id,
                    account_ids,
                    terms,
                } => {
                    builder = builder
                        .id(*id)
                        .user_id(*user_id)
                        .account_ids(*account_ids)
                        .terms(terms.clone());
                }
                FixedTermLoanEvent::Approved { .. } => {}
                FixedTermLoanEvent::InterestRecorded { .. } => {}
                FixedTermLoanEvent::PaymentRecorded { .. } => {}
                FixedTermLoanEvent::Completed { .. } => {}
            }
        }
        builder.events(events).build()
    }
}

#[derive(Debug, Builder)]
pub struct NewFixedTermLoan {
    #[builder(setter(into))]
    pub(super) id: FixedTermLoanId,
    #[builder(setter(into))]
    pub(super) user_id: UserId,
    #[builder(setter(into))]
    pub(super) account_ids: FixedTermLoanAccountIds,
    #[builder(setter(into))]
    pub(super) interest_interval: InterestInterval,
    #[builder(setter(into))]
    pub(super) rate: FixedTermLoanRate,
}

impl NewFixedTermLoan {
    pub fn builder() -> NewFixedTermLoanBuilder {
        NewFixedTermLoanBuilder::default()
    }

    pub(super) fn initial_events(self) -> EntityEvents<FixedTermLoanEvent> {
        EntityEvents::init(
            self.id,
            [FixedTermLoanEvent::Initialized {
                id: self.id,
                user_id: self.user_id,
                account_ids: self.account_ids,
                terms: FixedTermLoanTerms {
                    interval: self.interest_interval,
                    rate: self.rate,
                },
            }],
        )
    }
}
