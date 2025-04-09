use chrono::{DateTime, Utc};

use crate::{journal::JournalEntry, primitives::CalaTxId};

pub struct LedgerTransaction {
    pub id: CalaTxId,
    pub entries: Vec<JournalEntry>,
    pub created_at: DateTime<Utc>,
    pub description: Option<String>,
}

impl
    TryFrom<(
        cala_ledger::transaction::Transaction,
        Vec<cala_ledger::entry::Entry>,
    )> for LedgerTransaction
{
    type Error = super::error::LedgerTransactionError;

    fn try_from(
        (tx, entries): (
            cala_ledger::transaction::Transaction,
            Vec<cala_ledger::entry::Entry>,
        ),
    ) -> Result<Self, super::error::LedgerTransactionError> {
        let entries = entries
            .into_iter()
            .map(JournalEntry::try_from)
            .collect::<Result<_, _>>()?;

        Ok(Self {
            id: tx.id,
            entries,
            created_at: tx.created_at(),
            description: tx.into_values().description,
        })
    }
}
