use chrono::{DateTime, Utc};
use derive_builder::Builder;
use serde::{Deserialize, Serialize};

use super::{error::*, terms::*};
use crate::{
    entity::*,
    ledger::fixed_term_loan::{FixedTermLoanAccountIds, FixedTermLoanBalance},
    primitives::*,
};

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
    PaymentMade {
        tx_id: LedgerTxId,
        tx_ref: String,
        amount: UsdCents,
    },
    Repaid {
        interest_earned: UsdCents,
    },
}

impl EntityEvent for FixedTermLoanEvent {
    type EntityId = FixedTermLoanId;
    fn event_table_name() -> &'static str {
        "fixed_term_loan_events"
    }
}

#[derive(Debug, Clone, Copy)]
pub struct PaymentAllocation {
    pub payment_amount: UsdCents,
    pub amount_left_after_payment: UsdCents,
}

impl PaymentAllocation {
    pub fn new(amount: UsdCents, balances: &FixedTermLoanBalance) -> Self {
        let outstanding = balances.outstanding;
        match amount.cmp(&outstanding) {
            std::cmp::Ordering::Less => PaymentAllocation {
                payment_amount: amount,
                amount_left_after_payment: outstanding - amount,
            },
            std::cmp::Ordering::Equal => PaymentAllocation {
                payment_amount: amount,
                amount_left_after_payment: UsdCents::ZERO,
            },
            std::cmp::Ordering::Greater => PaymentAllocation {
                payment_amount: outstanding,
                amount_left_after_payment: UsdCents::ZERO,
            },
        }
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

    pub fn record_incur_interest_transaction(&mut self, tx_id: LedgerTxId) -> String {
        let tx_ref = format!(
            "{}-interest-{}",
            self.id,
            self.count_interest_incurred() + 1
        );
        self.events.push(FixedTermLoanEvent::InterestRecorded {
            tx_id,
            tx_ref: tx_ref.clone(),
        });
        tx_ref
    }

    fn count_interest_incurred(&self) -> usize {
        self.events
            .iter()
            .filter(|event| matches!(event, FixedTermLoanEvent::InterestRecorded { .. }))
            .count()
    }

    pub fn next_interest_at(&self) -> Option<DateTime<Utc>> {
        if self.count_interest_incurred() <= 1 {
            Some(Utc::now())
        } else {
            None
        }
    }

    pub fn make_payment(&mut self, tx_id: LedgerTxId, amount: UsdCents) -> String {
        let tx_ref = format!("{}-payment-{}", self.id, self.count_payment_made() + 1);
        self.events.push(FixedTermLoanEvent::PaymentMade {
            tx_id,
            tx_ref: tx_ref.clone(),
            amount,
        });
        tx_ref
    }

    fn count_payment_made(&self) -> usize {
        self.events
            .iter()
            .filter(|event| matches!(event, FixedTermLoanEvent::PaymentMade { .. }))
            .count()
    }

    pub fn allocate_payment(
        &mut self,
        amount: UsdCents,
        balances: &FixedTermLoanBalance,
    ) -> PaymentAllocation {
        PaymentAllocation::new(amount, balances)
    }

    pub fn mark_repaid(&mut self, interest_income: UsdCents) {
        self.events.push(FixedTermLoanEvent::Repaid {
            interest_earned: interest_income,
        })
    }

    pub fn is_repaid(&mut self) -> bool {
        self.events
            .iter()
            .filter(|event| matches!(event, FixedTermLoanEvent::Repaid { .. }))
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
                FixedTermLoanEvent::PaymentMade { .. } => {}
                FixedTermLoanEvent::Repaid { .. } => {}
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
