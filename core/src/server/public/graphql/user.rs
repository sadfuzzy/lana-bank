use async_graphql::*;

use crate::{primitives::UsdCents, server::shared_graphql::user::Withdrawal};

#[derive(InputObject)]
pub struct WithdrawalInitiateInput {
    pub amount: UsdCents,
    pub destination: String,
    pub reference: Option<String>,
}

#[derive(SimpleObject)]
pub struct WithdrawalInitiatePayload {
    pub withdrawal: Withdrawal,
}

impl From<crate::withdraw::Withdraw> for WithdrawalInitiatePayload {
    fn from(withdrawal: crate::withdraw::Withdraw) -> Self {
        Self {
            withdrawal: Withdrawal::from(withdrawal),
        }
    }
}
