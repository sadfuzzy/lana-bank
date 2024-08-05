use async_graphql::{SimpleObject, ID};

use crate::server::shared_graphql::primitives::{Timestamp, UUID};

#[derive(SimpleObject)]
pub struct AuditEntry {
    id: ID,
    subject: UUID,
    object: String,
    action: String,
    authorized: bool,
    created_at: Timestamp,
}

impl From<crate::audit::AuditEntry> for AuditEntry {
    fn from(audit_log: crate::audit::AuditEntry) -> Self {
        Self {
            id: audit_log.id.into(),
            subject: UUID::from(*audit_log.subject.as_ref()),
            object: audit_log.object.as_ref().into(),
            action: audit_log.action.as_ref().into(),
            authorized: audit_log.authorized,
            created_at: audit_log.created_at.into(),
        }
    }
}
