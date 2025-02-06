mod balance;
mod history;

use async_graphql::*;

pub use lana_app::credit_facility::{CreditFacility as DomainCreditFacility, ListDirection};

use crate::{primitives::*, LanaApp};

use super::terms::*;

use balance::*;
use history::*;

#[derive(SimpleObject, Clone)]
#[graphql(complex)]
pub struct CreditFacility {
    id: ID,
    credit_facility_id: UUID,
    facility_amount: UsdCents,
    collateral: Satoshis,
    collateralization_state: CollateralizationState,
    status: CreditFacilityStatus,
    created_at: Timestamp,
    activated_at: Option<Timestamp>,
    expires_at: Option<Timestamp>,

    #[graphql(skip)]
    pub(super) entity: Arc<DomainCreditFacility>,
}

impl From<DomainCreditFacility> for CreditFacility {
    fn from(credit_facility: DomainCreditFacility) -> Self {
        let activated_at: Option<Timestamp> = credit_facility.activated_at.map(|t| t.into());
        let expires_at: Option<Timestamp> = credit_facility.expires_at.map(|t| t.into());

        Self {
            id: credit_facility.id.to_global_id(),
            credit_facility_id: UUID::from(credit_facility.id),
            activated_at,
            expires_at,
            created_at: credit_facility.created_at().into(),
            facility_amount: credit_facility.initial_facility(),
            collateral: credit_facility.collateral(),
            collateralization_state: credit_facility.last_collateralization_state(),
            status: credit_facility.status(),

            entity: Arc::new(credit_facility),
        }
    }
}

#[ComplexObject]
impl CreditFacility {
    async fn credit_facility_terms(&self) -> TermValues {
        self.entity.terms.into()
    }

    async fn balance(&self, ctx: &Context<'_>) -> async_graphql::Result<CreditFacilityBalance> {
        let (app, sub) = crate::app_and_sub_from_ctx!(ctx);
        let balance = app
            .credit_facilities()
            .for_subject(sub)?
            .balance(self.entity.id)
            .await?;

        Ok(CreditFacilityBalance::from(balance))
    }

    async fn current_cvl(&self, ctx: &Context<'_>) -> async_graphql::Result<FacilityCVL> {
        let app = ctx.data_unchecked::<LanaApp>();
        let price = app.price().usd_cents_per_btc().await?;
        Ok(FacilityCVL::from(
            self.entity.facility_cvl_data().cvl(price),
        ))
    }

    async fn transactions(&self) -> Vec<CreditFacilityHistoryEntry> {
        self.entity
            .history()
            .into_iter()
            .map(CreditFacilityHistoryEntry::from)
            .collect()
    }
}

#[derive(SimpleObject)]
pub struct FacilityCVL {
    total: CVLPct,
    disbursed: CVLPct,
}

impl From<lana_app::credit_facility::FacilityCVL> for FacilityCVL {
    fn from(value: lana_app::credit_facility::FacilityCVL) -> Self {
        Self {
            total: value.total,
            disbursed: value.disbursed,
        }
    }
}
