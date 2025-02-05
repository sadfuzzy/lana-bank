use async_graphql::*;

use crate::primitives::*;

use super::terms::*;

pub use lana_app::credit_facility::{CreditFacility as DomainCreditFacility, ListDirection};

#[derive(SimpleObject, Clone)]
#[graphql(complex)]
pub struct CreditFacility {
    id: ID,
    credit_facility_id: UUID,
    activated_at: Option<Timestamp>,
    expires_at: Option<Timestamp>,
    created_at: Timestamp,
    collateralization_state: CollateralizationState,
    facility_amount: UsdCents,
    collateral: Satoshis,

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

            entity: Arc::new(credit_facility),
        }
    }
}

#[ComplexObject]
impl CreditFacility {
    async fn credit_facility_terms(&self) -> TermValues {
        self.entity.terms.into()
    }
}
