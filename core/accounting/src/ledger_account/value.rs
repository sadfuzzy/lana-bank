use crate::{
    AccountCode, BalanceRange, CalaAccount, CalaAccountBalance, CalaAccountId, CalaAccountSet,
    CalaAccountSetId, CalaBalanceRange, LedgerAccountId,
};

#[derive(Debug, Clone)]
pub struct LedgerAccount {
    pub id: LedgerAccountId,
    pub name: String,
    pub code: Option<AccountCode>,
    pub btc_balance_range: Option<BalanceRange>,
    pub usd_balance_range: Option<BalanceRange>,

    pub ancestor_ids: Vec<LedgerAccountId>,
    pub children_ids: Vec<LedgerAccountId>,

    is_leaf: bool,
}

impl LedgerAccount {
    pub(super) fn account_set_member_id(&self) -> cala_ledger::account_set::AccountSetMemberId {
        if self.is_leaf {
            CalaAccountId::from(self.id).into()
        } else {
            CalaAccountSetId::from(self.id).into()
        }
    }
}

impl
    From<(
        CalaAccountSet,
        Option<CalaAccountBalance>,
        Option<CalaAccountBalance>,
    )> for LedgerAccount
{
    fn from(
        (account_set, usd_balance, btc_balance): (
            CalaAccountSet,
            Option<CalaAccountBalance>,
            Option<CalaAccountBalance>,
        ),
    ) -> Self {
        let values = account_set.into_values();
        let code = values.external_id.and_then(|id| id.parse().ok());

        let usd_balance_range = usd_balance.map(|balance| BalanceRange {
            start: None,
            end: Some(balance.clone()),
            diff: Some(balance),
        });

        let btc_balance_range = btc_balance.map(|balance| BalanceRange {
            start: None,
            end: Some(balance.clone()),
            diff: Some(balance),
        });

        LedgerAccount {
            id: values.id.into(),
            name: values.name,
            code,
            btc_balance_range,
            usd_balance_range,
            ancestor_ids: Vec::new(),
            children_ids: Vec::new(),
            is_leaf: false,
        }
    }
}

impl
    From<(
        CalaAccountSet,
        Option<CalaBalanceRange>,
        Option<CalaBalanceRange>,
    )> for LedgerAccount
{
    fn from(
        (account_set, btc_balance_range, usd_balance_range): (
            CalaAccountSet,
            Option<CalaBalanceRange>,
            Option<CalaBalanceRange>,
        ),
    ) -> Self {
        let values = account_set.into_values();
        let code = values.external_id.and_then(|id| id.parse().ok());

        let usd_balance_range = usd_balance_range.map(|range| BalanceRange {
            start: Some(range.start),
            end: Some(range.end),
            diff: Some(range.diff),
        });
        let btc_balance_range = btc_balance_range.map(|range| BalanceRange {
            start: Some(range.start),
            end: Some(range.end),
            diff: Some(range.diff),
        });

        LedgerAccount {
            id: values.id.into(),
            name: values.name,
            code,
            btc_balance_range,
            usd_balance_range,
            ancestor_ids: Vec::new(),
            children_ids: Vec::new(),
            is_leaf: false,
        }
    }
}

impl
    From<(
        CalaAccount,
        Option<CalaAccountBalance>,
        Option<CalaAccountBalance>,
    )> for LedgerAccount
{
    fn from(
        (account, usd_balance, btc_balance): (
            CalaAccount,
            Option<CalaAccountBalance>,
            Option<CalaAccountBalance>,
        ),
    ) -> Self {
        let usd_balance_range = usd_balance.map(|balance| BalanceRange {
            start: None,
            end: Some(balance.clone()),
            diff: Some(balance),
        });

        let btc_balance_range = btc_balance.map(|balance| BalanceRange {
            start: None,
            end: Some(balance.clone()),
            diff: Some(balance),
        });

        LedgerAccount {
            id: account.id.into(),
            name: account.into_values().name,
            code: None,
            usd_balance_range,
            btc_balance_range,
            ancestor_ids: Vec::new(),
            children_ids: Vec::new(),
            is_leaf: true,
        }
    }
}
