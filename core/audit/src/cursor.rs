use serde::{Deserialize, Serialize};

use super::AuditEntry;
use crate::primitives::AuditEntryId;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AuditCursor {
    pub id: AuditEntryId,
}

impl<S, O, A> From<&AuditEntry<S, O, A>> for AuditCursor {
    fn from(entry: &AuditEntry<S, O, A>) -> Self {
        Self { id: entry.id }
    }
}

impl std::fmt::Display for AuditCursor {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.id)
    }
}

impl std::str::FromStr for AuditCursor {
    type Err = std::num::ParseIntError;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        let id = s.parse::<i64>()?;
        Ok(AuditCursor {
            id: AuditEntryId::from(id),
        })
    }
}
