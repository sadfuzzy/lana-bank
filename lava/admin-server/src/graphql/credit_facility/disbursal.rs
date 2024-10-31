use async_graphql::*;

use crate::{
    graphql::{approval_process::*, loader::LavaDataLoader},
    primitives::*,
};
pub use lava_app::credit_facility::Disbursement as DomainDisbursement;

#[derive(SimpleObject, Clone)]
#[graphql(complex)]
pub struct CreditFacilityDisbursement {
    id: ID,
    index: DisbursementIdx,
    amount: UsdCents,
    status: DisbursementStatus,
    created_at: Timestamp,

    #[graphql(skip)]
    pub(crate) entity: Arc<DomainDisbursement>,
}

impl From<DomainDisbursement> for CreditFacilityDisbursement {
    fn from(disbursement: DomainDisbursement) -> Self {
        Self {
            id: disbursement.id.to_global_id(),
            index: disbursement.idx,
            amount: disbursement.amount,
            status: disbursement.status(),
            created_at: disbursement.created_at().into(),
            entity: Arc::new(disbursement),
        }
    }
}

#[ComplexObject]
impl CreditFacilityDisbursement {
    async fn approval_process(&self, ctx: &Context<'_>) -> async_graphql::Result<ApprovalProcess> {
        let loader = ctx.data_unchecked::<LavaDataLoader>();
        let process = loader
            .load_one(self.entity.approval_process_id)
            .await?
            .expect("process not found");
        Ok(process)
    }
}

#[derive(InputObject)]
pub struct CreditFacilityDisbursementInitiateInput {
    pub credit_facility_id: UUID,
    pub amount: UsdCents,
}
crate::mutation_payload! { CreditFacilityDisbursementInitiatePayload, disbursement: CreditFacilityDisbursement }

#[derive(InputObject)]
pub struct CreditFacilityDisbursementConfirmInput {
    pub credit_facility_id: UUID,
    pub disbursement_idx: DisbursementIdx,
}
crate::mutation_payload! { CreditFacilityDisbursementConfirmPayload, disbursement: CreditFacilityDisbursement }
