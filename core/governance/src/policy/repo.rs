use sqlx::PgPool;

use es_entity::*;

use shared_primitives::{CommitteeId, PolicyId};

use super::{entity::*, error::*};

#[derive(EsRepo, Clone)]
#[es_repo(
    entity = "Policy",
    err = "PolicyError",
    columns(
        process_type(ty = "ApprovalProcessType"),
        committee_id(ty = "Option<CommitteeId>")
    )
)]
pub(crate) struct PolicyRepo {
    #[allow(dead_code)]
    pool: PgPool,
}

impl PolicyRepo {
    pub fn new(pool: &PgPool) -> Self {
        Self { pool: pool.clone() }
    }
}
