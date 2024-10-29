use async_graphql::*;

use crate::shared_graphql::{deposit::Deposit, primitives::*};
use lava_app::primitives::UsdCents;

pub use lava_app::deposit::DepositByCreatedAtCursor;

#[derive(InputObject)]
pub struct DepositRecordInput {
    pub customer_id: UUID,
    pub amount: UsdCents,
    pub reference: Option<String>,
}

#[derive(SimpleObject)]
pub struct DepositRecordPayload {
    pub deposit: Deposit,
}

impl From<lava_app::deposit::Deposit> for DepositRecordPayload {
    fn from(deposit: lava_app::deposit::Deposit) -> Self {
        Self {
            deposit: Deposit::from(deposit),
        }
    }
}
