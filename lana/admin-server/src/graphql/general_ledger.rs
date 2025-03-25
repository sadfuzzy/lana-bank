use async_graphql::*;

use cala_ledger::DebitOrCredit;
use lana_app::general_ledger::{
    BtcGeneralLedgerEntry as DomainBtcGeneralLedgerEntry,
    GeneralLedgerEntry as DomainGeneralLedgerEntry,
    UsdGeneralLedgerEntry as DomainUsdGeneralLedgerEntry,
};

pub use lana_app::general_ledger::GeneralLedgerEntryCursor;

use crate::primitives::*;

#[derive(Union)]
pub(super) enum GeneralLedgerEntry {
    Usd(UsdGeneralLedgerEntry),
    Btc(BtcGeneralLedgerEntry),
}

impl From<DomainGeneralLedgerEntry> for GeneralLedgerEntry {
    fn from(entry: DomainGeneralLedgerEntry) -> Self {
        match entry {
            DomainGeneralLedgerEntry::Usd(entry) => Self::Usd(entry.into()),
            DomainGeneralLedgerEntry::Btc(entry) => Self::Btc(entry.into()),
        }
    }
}

#[derive(SimpleObject)]
pub struct UsdGeneralLedgerEntry {
    id: ID,
    entry_id: UUID,
    entry_type: String,
    usd_amount: UsdCents,
    description: Option<String>,
    direction: DebitOrCredit,
    created_at: Timestamp,
}

impl From<DomainUsdGeneralLedgerEntry> for UsdGeneralLedgerEntry {
    fn from(entry: DomainUsdGeneralLedgerEntry) -> Self {
        Self {
            id: entry.entry_id.into(),
            entry_id: entry.entry_id.into(),
            entry_type: entry.entry_type,
            usd_amount: entry.usd_amount,
            description: entry.description,
            direction: entry.direction,
            created_at: entry.created_at.into(),
        }
    }
}

#[derive(SimpleObject)]
pub struct BtcGeneralLedgerEntry {
    id: ID,
    entry_id: UUID,
    entry_type: String,
    btc_amount: Satoshis,
    description: Option<String>,
    direction: DebitOrCredit,
    created_at: Timestamp,
}

impl From<DomainBtcGeneralLedgerEntry> for BtcGeneralLedgerEntry {
    fn from(entry: DomainBtcGeneralLedgerEntry) -> Self {
        Self {
            id: entry.entry_id.into(),
            entry_id: entry.entry_id.into(),
            entry_type: entry.entry_type,
            btc_amount: entry.btc_amount,
            description: entry.description,
            direction: entry.direction,
            created_at: entry.created_at.into(),
        }
    }
}
