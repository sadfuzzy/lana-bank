use async_graphql::*;

use crate::primitives::*;

use super::{customer::Customer, loader::LavaDataLoader};

pub use lava_app::deposit::{Deposit as DomainDeposit, DepositByCreatedAtCursor};

#[derive(SimpleObject, Clone)]
#[graphql(complex)]
pub struct Deposit {
    id: ID,
    deposit_id: UUID,
    customer_id: UUID,
    amount: UsdCents,
    created_at: Timestamp,

    #[graphql(skip)]
    pub(super) entity: Arc<DomainDeposit>,
}

impl From<DomainDeposit> for Deposit {
    fn from(deposit: DomainDeposit) -> Self {
        Deposit {
            id: deposit.id.to_global_id(),
            deposit_id: UUID::from(deposit.id),
            customer_id: UUID::from(deposit.customer_id),
            amount: deposit.amount,
            created_at: deposit.created_at().into(),

            entity: Arc::new(deposit),
        }
    }
}

#[ComplexObject]
impl Deposit {
    async fn reference(&self) -> &str {
        &self.entity.reference
    }

    async fn customer(&self, ctx: &Context<'_>) -> async_graphql::Result<Customer> {
        let loader = ctx.data_unchecked::<LavaDataLoader>();
        let customer = loader
            .load_one(self.entity.customer_id)
            .await?
            .expect("policy not found");
        Ok(customer)
    }
}

#[derive(InputObject)]
pub struct DepositRecordInput {
    pub customer_id: UUID,
    pub amount: UsdCents,
    pub reference: Option<String>,
}
crate::mutation_payload! { DepositRecordPayload, deposit: Deposit }
