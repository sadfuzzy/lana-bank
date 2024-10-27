use sqlx::PgPool;

use es_entity::*;

use crate::{
    data_export::Export,
    primitives::{ApprovalProcessType, CommitteeId, ProcessAssignmentId},
};

use super::{entity::*, error::*};

#[derive(EsRepo, Clone)]
#[es_repo(
    entity = "ProcessAssignment",
    err = "ProcessAssignmentError",
    columns(
        approval_process_type(ty = "ApprovalProcessType", update(persist = false)),
        committee_id(ty = "Option<CommitteeId>", create(persist = false))
    )
)]
pub struct ProcessAssignmentRepo {
    pool: PgPool,
    _export: Export,
}

impl ProcessAssignmentRepo {
    pub fn new(pool: &PgPool, export: &Export) -> Self {
        Self {
            pool: pool.clone(),
            _export: export.clone(),
        }
    }
}
