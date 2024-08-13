use chrono::{DateTime, Utc};

pub mod error;
use error::AuditError;

mod cursor;
pub use cursor::AuditCursor;

use sqlx::prelude::FromRow;

use crate::{
    authorization::{Action, Object},
    primitives::{AuditEntryId, Subject},
};

pub struct AuditEntry {
    pub id: AuditEntryId,
    pub subject: Subject,
    pub object: Object,
    pub action: Action,
    pub authorized: bool,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, FromRow)]
struct RawAuditEntry {
    id: AuditEntryId,
    subject: String,
    object: String,
    action: String,
    authorized: bool,
    created_at: DateTime<Utc>,
}

#[derive(Clone)]
pub struct Audit {
    pool: sqlx::PgPool,
}

impl Audit {
    pub fn new(pool: &sqlx::PgPool) -> Self {
        Self { pool: pool.clone() }
    }

    pub async fn persist(
        &self,
        subject: &Subject,
        object: Object,
        action: Action,
        authorized: bool,
    ) -> Result<(), AuditError> {
        sqlx::query!(
            r#"
                INSERT INTO audit_entries (subject, object, action, authorized)
                VALUES ($1, $2, $3, $4)
                "#,
            subject.to_string(),
            object.as_ref(),
            action.as_ref(),
            authorized,
        )
        .execute(&self.pool)
        .await?;

        Ok(())
    }

    pub async fn list(
        &self,
        query: crate::query::PaginatedQueryArgs<AuditCursor>,
    ) -> Result<crate::query::PaginatedQueryRet<AuditEntry, AuditCursor>, AuditError> {
        // Extract the after_id and limit from the query
        let after_id: Option<i64> = query.after.map(|cursor| cursor.id);

        let limit = i64::try_from(query.first)?;

        // Fetch the raw events with pagination
        let raw_events: Vec<RawAuditEntry> = sqlx::query_as!(
            RawAuditEntry,
            r#"
            SELECT id, subject, object, action, authorized, created_at
            FROM audit_entries
            WHERE ($1::BIGINT IS NULL OR id < $1::BIGINT)
            ORDER BY id DESC
            LIMIT $2
            "#,
            after_id,
            limit + 1,
        )
        .fetch_all(&self.pool)
        .await?;

        // Determine if there is a next page
        let has_next_page = raw_events.len() as i64 > limit;

        // If we fetched one extra, remove it from the results
        let events = if has_next_page {
            raw_events
                .into_iter()
                .take(limit.try_into().expect("can't convert to usize"))
                .collect()
        } else {
            raw_events
        };

        // Create the next cursor if there is a next page
        let end_cursor = if has_next_page {
            events.last().map(|event| AuditCursor { id: event.id.0 })
        } else {
            None
        };

        // Map raw events to the desired return type
        let audit_entries: Vec<AuditEntry> = events
            .into_iter()
            .map(|raw_event| AuditEntry {
                id: raw_event.id,
                subject: raw_event.subject.parse().expect("Could not parse subject"),
                object: raw_event.object.parse().expect("Could not parse object"),
                action: raw_event.action.parse().expect("Could not parse action"),
                authorized: raw_event.authorized,
                created_at: raw_event.created_at,
            })
            .collect();

        // Return the paginated result
        Ok(crate::query::PaginatedQueryRet {
            entities: audit_entries,
            has_next_page,
            end_cursor,
        })
    }
}
