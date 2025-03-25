pub mod error;
use error::*;

mod entry;
pub use entry::*;

use cala_ledger::{CalaLedger, JournalId};
use rbac_types::{GeneralLedgerAction, Subject};

use crate::authorization::{Authorization, Object};
use authz::PermissionCheck;

#[derive(Clone)]
pub struct GeneralLedger {
    authz: Authorization,
    cala: CalaLedger,
    journal_id: JournalId,
}

impl GeneralLedger {
    pub fn init(authz: &Authorization, cala: &CalaLedger, journal_id: JournalId) -> Self {
        Self {
            authz: authz.clone(),
            cala: cala.clone(),
            journal_id,
        }
    }

    pub async fn entries(
        &self,
        sub: &Subject,
        args: es_entity::PaginatedQueryArgs<GeneralLedgerEntryCursor>,
    ) -> Result<
        es_entity::PaginatedQueryRet<GeneralLedgerEntry, GeneralLedgerEntryCursor>,
        GeneralLedgerError,
    > {
        self.authz
            .enforce_permission(sub, Object::GeneralLedger, GeneralLedgerAction::ReadEntries)
            .await?;

        let cala_cursor = es_entity::PaginatedQueryArgs {
            after: args
                .after
                .map(cala_ledger::entry::EntriesByCreatedAtCursor::from),
            first: args.first,
        };

        let ret = self
            .cala
            .entries()
            .list_for_journal_id(
                self.journal_id,
                cala_cursor,
                es_entity::ListDirection::Descending,
            )
            .await?;

        let entities = ret
            .entities
            .into_iter()
            .map(GeneralLedgerEntry::try_from)
            .collect::<Result<Vec<_>, _>>()?;

        Ok(es_entity::PaginatedQueryRet {
            entities,
            has_next_page: ret.has_next_page,
            end_cursor: ret.end_cursor.map(GeneralLedgerEntryCursor::from),
        })
    }
}
