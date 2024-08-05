use chrono::{DateTime, Utc};

pub mod error;
use error::AuditError;

use sqlx::prelude::FromRow;
use uuid::Uuid;

use crate::{
    authorization::{Action, Object},
    primitives::Subject,
};

pub struct AuditEntry {
    pub id: Uuid,
    pub subject: Subject,
    pub object: Object,
    pub action: Action,
    pub authorized: bool,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, FromRow)]
struct RawAuditEntry {
    id: Uuid,
    subject: Uuid,
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
        let id = Uuid::new_v4();

        sqlx::query!(
            r#"
                INSERT INTO audit_entries (id, subject, object, action, authorized)
                VALUES ($1, $2, $3, $4, $5)
                "#,
            id,
            subject.as_ref(),
            object.as_ref(),
            action.as_ref(),
            authorized,
        )
        .execute(&self.pool)
        .await?;

        Ok(())
    }

    pub async fn list(&self) -> Result<Vec<AuditEntry>, AuditError> {
        let raw_events: Vec<RawAuditEntry> = sqlx::query_as!(
            RawAuditEntry,
            r#"
            SELECT id, subject, object, action, authorized, created_at
            FROM audit_entries
            WHERE authorized = $1
            "#,
            true
        )
        .fetch_all(&self.pool)
        .await?;

        let events: Vec<AuditEntry> = raw_events
            .into_iter()
            .map(|raw_event| AuditEntry {
                id: raw_event.id,
                subject: Subject::from(raw_event.subject),
                object: raw_event.object.parse().expect("Could not parse object"),
                action: raw_event.action.parse().expect("Could not parse action"),
                authorized: raw_event.authorized,
                created_at: raw_event.created_at,
            })
            .collect();

        Ok(events)
    }
}
