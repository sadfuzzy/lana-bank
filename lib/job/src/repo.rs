use sqlx::PgPool;

use es_entity::*;

use super::{entity::*, error::*};
use crate::JobId;

#[derive(EsRepo, Clone)]
#[es_repo(entity = "Job", err = "JobError", columns(job_type(ty = "JobType"),))]
pub struct JobRepo {
    pool: PgPool,
}

impl JobRepo {
    pub(super) fn new(pool: &PgPool) -> Self {
        Self { pool: pool.clone() }
    }
}
