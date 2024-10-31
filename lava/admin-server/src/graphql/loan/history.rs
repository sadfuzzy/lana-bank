use async_graphql::*;

use crate::primitives::*;

use crate::graphql::{loader::LavaDataLoader, user::*};
pub use lava_app::{loan::LoanCollaterizationState, primitives::CollateralAction};

#[derive(async_graphql::Union)]
pub enum LoanHistoryEntry {
    Payment(IncrementalPayment),
    Interest(InterestAccrued),
    Collateral(CollateralUpdated),
    Origination(LoanOrigination),
    Collateralization(CollateralizationUpdated),
}

impl From<lava_app::loan::LoanHistoryEntry> for LoanHistoryEntry {
    fn from(transaction: lava_app::loan::LoanHistoryEntry) -> Self {
        match transaction {
            lava_app::loan::LoanHistoryEntry::Payment(payment) => {
                LoanHistoryEntry::Payment(payment.into())
            }
            lava_app::loan::LoanHistoryEntry::Interest(interest) => {
                LoanHistoryEntry::Interest(interest.into())
            }
            lava_app::loan::LoanHistoryEntry::Collateral(collateral) => {
                LoanHistoryEntry::Collateral(collateral.into())
            }
            lava_app::loan::LoanHistoryEntry::Origination(origination) => {
                LoanHistoryEntry::Origination(origination.into())
            }
            lava_app::loan::LoanHistoryEntry::Collateralization(collateralization) => {
                LoanHistoryEntry::Collateralization(collateralization.into())
            }
        }
    }
}

#[derive(SimpleObject)]
pub struct IncrementalPayment {
    pub cents: UsdCents,
    pub recorded_at: Timestamp,
    pub tx_id: UUID,
}

impl From<lava_app::loan::IncrementalPayment> for IncrementalPayment {
    fn from(payment: lava_app::loan::IncrementalPayment) -> Self {
        IncrementalPayment {
            cents: payment.cents,
            recorded_at: payment.recorded_at.into(),
            tx_id: payment.tx_id.into(),
        }
    }
}

#[derive(SimpleObject)]
pub struct InterestAccrued {
    pub cents: UsdCents,
    pub recorded_at: Timestamp,
    pub tx_id: UUID,
}

impl From<lava_app::loan::InterestAccrued> for InterestAccrued {
    fn from(interest: lava_app::loan::InterestAccrued) -> Self {
        InterestAccrued {
            cents: interest.cents,
            recorded_at: interest.recorded_at.into(),
            tx_id: interest.tx_id.into(),
        }
    }
}

#[derive(SimpleObject)]
pub struct CollateralUpdated {
    pub satoshis: Satoshis,
    pub recorded_at: Timestamp,
    pub action: CollateralAction,
    pub tx_id: UUID,
}

impl From<lava_app::loan::CollateralUpdated> for CollateralUpdated {
    fn from(collateral: lava_app::loan::CollateralUpdated) -> Self {
        CollateralUpdated {
            satoshis: collateral.satoshis,
            recorded_at: collateral.recorded_at.into(),
            action: collateral.action,
            tx_id: collateral.tx_id.into(),
        }
    }
}

#[derive(SimpleObject)]
pub struct LoanOrigination {
    pub cents: UsdCents,
    pub recorded_at: Timestamp,
    pub tx_id: UUID,
}

impl From<lava_app::loan::LoanOrigination> for LoanOrigination {
    fn from(origination: lava_app::loan::LoanOrigination) -> Self {
        LoanOrigination {
            cents: origination.cents,
            recorded_at: origination.recorded_at.into(),
            tx_id: origination.tx_id.into(),
        }
    }
}

#[derive(SimpleObject)]
pub struct CollateralizationUpdated {
    pub state: LoanCollaterizationState,
    pub collateral: Satoshis,
    pub outstanding_interest: UsdCents,
    pub outstanding_principal: UsdCents,
    pub price: UsdCents,
    pub recorded_at: Timestamp,
}

impl From<lava_app::loan::CollateralizationUpdated> for CollateralizationUpdated {
    fn from(collateralization: lava_app::loan::CollateralizationUpdated) -> Self {
        CollateralizationUpdated {
            state: collateralization.state,
            collateral: collateralization.collateral,
            outstanding_interest: collateralization.outstanding_interest,
            outstanding_principal: collateralization.outstanding_principal,
            price: collateralization.price.into_inner(),
            recorded_at: collateralization.recorded_at.into(),
        }
    }
}

#[derive(SimpleObject)]
#[graphql(complex)]
pub struct LoanApproval {
    #[graphql(skip)]
    user_id: UserId,
    approved_at: Timestamp,
}

impl From<lava_app::loan::LoanApproval> for LoanApproval {
    fn from(approver: lava_app::loan::LoanApproval) -> Self {
        LoanApproval {
            user_id: approver.user_id,
            approved_at: approver.approved_at.into(),
        }
    }
}

#[ComplexObject]
impl LoanApproval {
    async fn user(&self, ctx: &Context<'_>) -> async_graphql::Result<User> {
        let loader = ctx.data_unchecked::<LavaDataLoader>();
        let users = loader
            .load_one(self.user_id)
            .await?
            .expect("user not found");

        Ok(users)
    }
}
