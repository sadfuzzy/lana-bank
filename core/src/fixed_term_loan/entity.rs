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

    pub fn record_interest_transaction(&mut self, tx_id: LedgerTxId) -> String {
        let tx_ref = format!(
            "{}-interest-{}",
            self.id,
            self.count_interest_payments() + 1
        );
        self.events.push(FixedTermLoanEvent::InterestRecorded {
            tx_id,
            tx_ref: tx_ref.clone(),
        });
        tx_ref
    }

    fn count_interest_payments(&self) -> usize {
        self.events
            .iter()
            .filter(|event| matches!(event, FixedTermLoanEvent::InterestRecorded { .. }))
            .count()
    }

    pub fn next_interest_at(&self) -> Option<DateTime<Utc>> {
        if self.count_interest_payments() <= 1 {
            Some(Utc::now())
        } else {
            None
        }
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
