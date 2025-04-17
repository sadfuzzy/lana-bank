use sqlx::PgPool;

use es_entity::*;

use crate::primitives::*;

use super::{entity::*, error::PaymentAllocationError};

#[derive(EsRepo, Clone)]
#[es_repo(
    entity = "PaymentAllocation",
    err = "PaymentAllocationError",
    columns(
        credit_facility_id(ty = "CreditFacilityId", list_for, update(persist = false)),
        payment_id(ty = "PaymentId", list_for, update(persist = false)),
        obligation_id(ty = "ObligationId", update(persist = false)),
    ),
    tbl_prefix = "core"
)]
pub struct PaymentAllocationRepo {
    #[allow(dead_code)]
    pool: PgPool,
}

impl PaymentAllocationRepo {
    pub fn new(pool: &PgPool) -> Self {
        Self { pool: pool.clone() }
    }
}
