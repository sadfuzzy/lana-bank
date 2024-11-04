use sqlx::PgPool;

use es_entity::*;

use crate::{data_export::Export, primitives::*};

use super::{entity::*, error::DisbursalError};

#[derive(EsRepo, Clone)]
#[es_repo(
    entity = "Disbursal",
    err = "DisbursalError",
    columns(
        credit_facility_id(ty = "CreditFacilityId", update(persist = false), list_for),
        approval_process_id(ty = "ApprovalProcessId", update(persist = "false")),
        idx(ty = "DisbursalIdx", update(persist = false)),
    )
)]
pub(in crate::credit_facility) struct DisbursalRepo {
    pool: PgPool,
    _export: Export,
}

impl DisbursalRepo {
    pub fn new(pool: &PgPool, export: &Export) -> Self {
        Self {
            pool: pool.clone(),
            _export: export.clone(),
        }
    }
}
