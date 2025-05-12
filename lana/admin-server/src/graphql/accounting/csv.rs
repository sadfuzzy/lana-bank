use async_graphql::*;

use crate::primitives::*;
pub use lana_app::accounting::csv::{AccountingCsv as DomainAccountingCsv, AccountingCsvStatus};
use std::sync::Arc;

#[derive(SimpleObject, Clone)]
pub struct AccountingCsv {
    id: ID,
    csv_id: UUID,
    status: AccountingCsvStatus,
    created_at: Timestamp,

    #[graphql(skip)]
    pub entity: Arc<DomainAccountingCsv>,
}

impl From<DomainAccountingCsv> for AccountingCsv {
    fn from(csv: DomainAccountingCsv) -> Self {
        Self {
            id: csv.id.into(),
            csv_id: UUID::from(csv.id),
            status: csv.status(),
            created_at: csv.created_at().into(),
            entity: Arc::new(csv),
        }
    }
}

#[derive(SimpleObject)]
pub struct AccountingCsvDownloadLink {
    pub url: String,
    pub csv_id: UUID,
}

impl From<lana_app::accounting::csv::GeneratedAccountingCsvDownloadLink>
    for AccountingCsvDownloadLink
{
    fn from(result: lana_app::accounting::csv::GeneratedAccountingCsvDownloadLink) -> Self {
        Self {
            url: result.link.url,
            csv_id: UUID::from(result.accounting_csv_id),
        }
    }
}

#[derive(InputObject)]
pub struct LedgerAccountCsvCreateInput {
    pub ledger_account_id: UUID,
}
crate::mutation_payload! { LedgerAccountCsvCreatePayload, accounting_csv: AccountingCsv }

#[derive(InputObject)]
pub struct AccountingCsvDownloadLinkGenerateInput {
    pub accounting_csv_id: UUID,
}
crate::mutation_payload! { AccountingCsvDownloadLinkGeneratePayload, link: AccountingCsvDownloadLink }
