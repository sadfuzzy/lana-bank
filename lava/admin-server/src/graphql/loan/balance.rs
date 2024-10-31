use async_graphql::*;

use crate::{
    graphql::credit_facility::{Collateral, Outstanding},
    primitives::*,
};

#[derive(SimpleObject)]
pub struct LoanBalance {
    collateral: Collateral,
    outstanding: Outstanding,
    interest_incurred: InterestIncome,
}

impl From<lava_app::ledger::loan::LoanBalance> for LoanBalance {
    fn from(balance: lava_app::ledger::loan::LoanBalance) -> Self {
        Self {
            collateral: Collateral {
                btc_balance: balance.collateral,
            },
            outstanding: Outstanding {
                usd_balance: balance.principal_receivable + balance.interest_receivable,
            },
            interest_incurred: InterestIncome {
                usd_balance: balance.interest_incurred,
            },
        }
    }
}

#[derive(SimpleObject)]
struct InterestIncome {
    usd_balance: UsdCents,
}
