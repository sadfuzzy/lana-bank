use sqlx::PgPool;

use es_entity::*;

use crate::{data_export::Export, primitives::CommitteeId};

use super::{entity::*, error::*};

#[derive(EsRepo, Clone)]
#[es_repo(entity = "Committee", err = "CommitteeError", columns(name = "String"))]
pub struct CommitteeRepo {
    pool: PgPool,
    _export: Export,
}

impl CommitteeRepo {
    pub fn new(pool: &PgPool, export: &Export) -> Self {
        Self {
            pool: pool.clone(),
            _export: export.clone(),
        }
    }
}
