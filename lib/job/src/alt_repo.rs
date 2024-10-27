use sqlx::PgPool;

use es_entity::*;

use super::{alt_entity::*, entity::JobType, error::*};

#[derive(EsRepo, Clone)]
#[es_repo(
    entity = "AltJob",
    err = "JobError",
    columns(job_type(ty = "JobType"),)
)]
pub struct AltJobRepo {
    pool: PgPool,
}

impl AltJobRepo {
    pub(super) fn new(pool: &PgPool) -> Self {
        Self { pool: pool.clone() }
    }
}
