use sqlx::PgPool;

use crate::primitives::JobId;

pub struct CurrentJob {
    id: JobId,
    pool: PgPool,
}

impl CurrentJob {
    pub(super) fn new(id: JobId, pool: PgPool) -> Self {
        Self { id, pool }
    }

    pub fn id(&self) -> JobId {
        self.id
    }

    pub fn pool(&self) -> &PgPool {
        &self.pool
    }
}
