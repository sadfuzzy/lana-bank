use async_graphql::*;

use crate::{
    primitives::UsdCents,
    server::shared_graphql::{deposit::Deposit, primitives::*},
};

pub use crate::deposit::DepositByCreatedAtCursor;

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

impl From<crate::deposit::Deposit> for DepositRecordPayload {
    fn from(deposit: crate::deposit::Deposit) -> Self {
        Self {
            deposit: Deposit::from(deposit),
        }
    }
}
