use async_graphql::*;

use crate::{
    ledger,
    primitives::{Satoshis, UsdCents},
};

#[derive(SimpleObject)]
struct Collateral {
    btc_balance: Satoshis,
}

#[derive(SimpleObject)]
struct Principal {
    usd_balance: UsdCents,
}

#[derive(SimpleObject)]
struct InterestIncome {
    usd_balance: UsdCents,
}

#[derive(SimpleObject)]
struct InterestIncurredAndUnpaid {
    usd_balance: UsdCents,
}

#[derive(SimpleObject)]
pub(super) struct FixedTermLoanBalance {
    collateral: Collateral,
    principal: Principal,
    total_interest_incurred: InterestIncome,
    unpaid_interest_incurred: InterestIncurredAndUnpaid,
}

impl From<ledger::fixed_term_loan::FixedTermLoanBalance> for FixedTermLoanBalance {
    fn from(balance: ledger::fixed_term_loan::FixedTermLoanBalance) -> Self {
        Self {
            collateral: Collateral {
                btc_balance: balance.collateral,
            },
            principal: Principal {
                usd_balance: balance.principal,
            },
            total_interest_incurred: InterestIncome {
                usd_balance: balance.total_interest_incurred,
            },
            unpaid_interest_incurred: InterestIncurredAndUnpaid {
                usd_balance: balance.unpaid_interest_incurred,
            },
        }
    }
}
