use derive_builder::Builder;

use cala_ledger::{Currency, DebitOrCredit};
use rust_decimal::Decimal;

use crate::primitives::{AccountCode, LedgerAccountId};

pub use cala_ledger::TransactionId as CalaTransactionId;

#[derive(Builder)]
pub struct ManualEntryInput {
    pub(super) account_id_or_code: AccountIdOrCode,
    pub(super) amount: Decimal,
    pub(super) currency: Currency,
    #[builder(setter(into))]
    pub(super) description: String,
    pub(super) direction: DebitOrCredit,
}

#[derive(Clone, Debug)]
pub enum AccountIdOrCode {
    Id(LedgerAccountId),
    Code(AccountCode),
}

impl std::str::FromStr for AccountIdOrCode {
    type Err = anyhow::Error;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        if let Ok(id) = s.parse::<LedgerAccountId>() {
            Ok(AccountIdOrCode::Id(id))
        } else {
            Ok(AccountIdOrCode::Code(s.parse()?))
        }
    }
}

impl ManualEntryInput {
    pub fn builder() -> ManualEntryInputBuilder {
        ManualEntryInputBuilder::default()
    }
}
