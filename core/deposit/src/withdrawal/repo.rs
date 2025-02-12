use sqlx::PgPool;

use es_entity::*;

use crate::primitives::{ApprovalProcessId, DepositAccountId, LedgerTransactionId, WithdrawalId};

use super::{entity::*, error::*};

#[derive(EsRepo, Clone)]
#[es_repo(
    entity = "Withdrawal",
    err = "WithdrawalError",
    columns(
        deposit_account_id(ty = "DepositAccountId", list_for, update(persist = false)),
        approval_process_id(ty = "ApprovalProcessId", update(persist = false)),
        cancelled_tx_id(ty = "Option<LedgerTransactionId>", create(persist = false)),
        reference(ty = "String", create(accessor = "reference()"))
    ),
    tbl_prefix = "core"
)]
pub struct WithdrawalRepo {
    pool: PgPool,
}

impl WithdrawalRepo {
    pub fn new(pool: &PgPool) -> Self {
        Self { pool: pool.clone() }
    }
}
