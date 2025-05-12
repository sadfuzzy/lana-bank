use std::collections::HashMap;

use cala_ledger::{
    account::Account,
    account_set::{AccountSet, AccountSetId, AccountSetMemberId},
    balance::AccountBalance,
    CalaLedger, Currency, JournalId,
};

use crate::{
    journal_error::JournalError, AccountCode, BalanceRange, LedgerAccount, LedgerAccountId,
};

#[derive(Clone)]
pub struct LedgerTransactionLedger {
    cala: CalaLedger,
}

impl LedgerTransactionLedger {
    pub fn new(cala: &CalaLedger) -> Self {
        Self { cala: cala.clone() }
    }
}
