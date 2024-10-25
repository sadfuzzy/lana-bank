use serde::{Deserialize, Serialize};

#[derive(sqlx::Type, Debug, Copy, Clone, Eq, PartialEq, Hash, Serialize, Deserialize)]
#[sqlx(transparent)]
pub struct AuditEntryId(i64);

impl std::fmt::Display for AuditEntryId {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        self.0.fmt(f)
    }
}

impl From<i64> for AuditEntryId {
    fn from(value: i64) -> AuditEntryId {
        AuditEntryId(value)
    }
}

impl From<AuditEntryId> for i64 {
    fn from(value: AuditEntryId) -> i64 {
        value.0
    }
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
pub struct AuditInfo<S> {
    pub sub: S,
    pub audit_entry_id: AuditEntryId,
}

impl<T, U, S> From<(T, U)> for AuditInfo<S>
where
    T: Into<AuditEntryId>,
    U: Into<S>,
{
    fn from((audit_entry_id, sub): (T, U)) -> Self {
        Self {
            sub: sub.into(),
            audit_entry_id: audit_entry_id.into(),
        }
    }
}
