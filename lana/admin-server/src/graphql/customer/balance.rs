use async_graphql::*;

use crate::primitives::*;

#[derive(SimpleObject)]
pub struct CustomerBalance {
    checking: Checking,
}

impl From<lana_app::ledger::customer::CustomerBalance> for CustomerBalance {
    fn from(balance: lana_app::ledger::customer::CustomerBalance) -> Self {
        Self {
            checking: Checking {
                settled: balance.usd_balance.settled,
                pending: balance.usd_balance.pending,
            },
        }
    }
}

#[derive(SimpleObject)]
struct Checking {
    settled: UsdCents,
    pending: UsdCents,
}
