use async_graphql::*;

use crate::shared_graphql::{primitives::UUID, withdraw::Withdrawal};
use lava_app::primitives::UsdCents;

pub use lava_app::withdraw::WithdrawByCreatedAtCursor;

#[derive(InputObject)]
pub struct WithdrawalInitiateInput {
    pub customer_id: UUID,
    pub amount: UsdCents,
    pub reference: Option<String>,
}

#[derive(SimpleObject)]
pub struct WithdrawalInitiatePayload {
    pub withdrawal: Withdrawal,
}

impl From<lava_app::withdraw::Withdraw> for WithdrawalInitiatePayload {
    fn from(withdrawal: lava_app::withdraw::Withdraw) -> Self {
        Self {
            withdrawal: Withdrawal::from(withdrawal),
        }
    }
}

#[derive(InputObject)]
pub struct WithdrawalConfirmInput {
    pub withdrawal_id: UUID,
}

#[derive(SimpleObject)]
pub struct WithdrawalConfirmPayload {
    pub withdrawal: Withdrawal,
}

impl From<lava_app::withdraw::Withdraw> for WithdrawalConfirmPayload {
    fn from(withdrawal: lava_app::withdraw::Withdraw) -> Self {
        Self {
            withdrawal: Withdrawal::from(withdrawal),
        }
    }
}

#[derive(InputObject)]
pub struct WithdrawalCancelInput {
    pub withdrawal_id: UUID,
}

#[derive(SimpleObject)]
pub struct WithdrawalCancelPayload {
    pub withdrawal: Withdrawal,
}

impl From<lava_app::withdraw::Withdraw> for WithdrawalCancelPayload {
    fn from(withdrawal: lava_app::withdraw::Withdraw) -> Self {
        Self {
            withdrawal: Withdrawal::from(withdrawal),
        }
    }
}
