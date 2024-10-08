use sqlx::{PgPool, Transaction};

use crate::{
    entity::*,
    primitives::{CustomerId, DocumentId},
};

use super::{entity::*, error::DocumentError};

#[derive(Clone)]
pub struct DocumentsRepo {
    pool: PgPool,
}

impl DocumentsRepo {
    pub(super) fn new(pool: &PgPool) -> Self {
        Self { pool: pool.clone() }
    }

    pub(super) async fn create_in_tx(
        &self,
        db: &mut sqlx::Transaction<'_, sqlx::Postgres>,
        new_document: NewDocument,
    ) -> Result<Document, DocumentError> {
        sqlx::query!(
            r#"INSERT INTO documents (id, customer_id)
            VALUES ($1, $2)"#,
            new_document.id as DocumentId,
            new_document.customer_id as CustomerId,
        )
        .execute(&mut **db)
        .await?;
        let mut events = new_document.initial_events();
        events.persist(db).await?;

        let document = Document::try_from(events)?;
        Ok(document)
    }

    pub async fn find_by_id(&self, id: DocumentId) -> Result<Document, DocumentError> {
        let rows = sqlx::query_as!(
            GenericEvent,
            r#"SELECT w.id, e.sequence, e.event,
               w.created_at AS entity_created_at, e.recorded_at AS event_recorded_at
               FROM documents w
               JOIN document_events e ON w.id = e.id
               WHERE w.id = $1"#,
            id as DocumentId,
        )
        .fetch_all(&self.pool)
        .await?;

        match EntityEvents::load_first(rows) {
            Ok(document) => Ok(document),
            Err(EntityError::NoEntityEventsPresent) => {
                Err(DocumentError::CouldNotFindById(id.to_string()))
            }
            Err(e) => Err(e.into()),
        }
    }

    pub async fn list_for_customer(
        &self,
        customer_id: CustomerId,
    ) -> Result<Vec<Document>, DocumentError> {
        let rows = sqlx::query_as!(
            GenericEvent,
            r#"SELECT w.id, e.sequence, e.event,
               w.created_at AS entity_created_at, e.recorded_at AS event_recorded_at
               FROM documents w
               JOIN document_events e ON w.id = e.id
               WHERE w.customer_id = $1
               ORDER BY w.id, e.sequence"#,
            customer_id as CustomerId,
        )
        .fetch_all(&self.pool)
        .await?;

        let n = rows.len();
        let documents = EntityEvents::load_n(rows, n)?;
        Ok(documents.0)
    }

    pub async fn persist_in_tx(
        &self,
        db: &mut Transaction<'_, sqlx::Postgres>,
        document: &mut Document,
    ) -> Result<(), DocumentError> {
        document.events.persist(db).await?;
        Ok(())
    }
}
