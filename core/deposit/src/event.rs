use serde::{Deserialize, Serialize};

use super::{DepositAccountId, DepositId, WithdrawalId};
use core_money::UsdCents;

#[derive(Debug, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum CoreDepositEvent {
    DepositInitialized {
        id: DepositId,
        deposit_account_id: DepositAccountId,
        amount: UsdCents,
    },
    WithdrawalConfirmed {
        id: WithdrawalId,
        deposit_account_id: DepositAccountId,
        amount: UsdCents,
    },
}
