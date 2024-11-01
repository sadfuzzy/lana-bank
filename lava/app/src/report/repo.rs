use sqlx::PgPool;

use es_entity::*;

use crate::{data_export::Export, primitives::ReportId};

use super::{entity::*, error::*};

const BQ_TABLE_NAME: &str = "report_events";

#[derive(EsRepo, Clone)]
#[es_repo(entity = "Report", err = "ReportError", post_persist_hook = "export")]
pub struct ReportRepo {
    pool: PgPool,
    export: Export,
}

impl ReportRepo {
    pub(super) fn new(pool: &PgPool, export: &Export) -> Self {
        Self {
            pool: pool.clone(),
            export: export.clone(),
        }
    }

    async fn export(
        &self,
        db: &mut sqlx::Transaction<'_, sqlx::Postgres>,
        events: impl Iterator<Item = &PersistedEvent<ReportEvent>>,
    ) -> Result<(), ReportError> {
        self.export
            .es_entity_export(db, BQ_TABLE_NAME, events)
            .await?;
        Ok(())
    }
}
