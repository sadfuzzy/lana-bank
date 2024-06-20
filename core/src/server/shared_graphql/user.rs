use async_graphql::*;

use crate::primitives::UserId;
use crate::{app::LavaApp, ledger, primitives::UsdCents, server::shared_graphql::primitives::UUID};

use super::objects::{BtcBalance, UsdBalance};

use super::fixed_term_loan::FixedTermLoan;

#[derive(SimpleObject)]
#[graphql(complex)]
pub struct User {
    user_id: UUID,
    btc_deposit_address: String,
    ust_deposit_address: String,
    email: String,
    #[graphql(skip)]
    account_ids: ledger::user::UserLedgerAccountIds,
}

#[ComplexObject]
impl User {
    async fn balance(&self, ctx: &Context<'_>) -> async_graphql::Result<UserBalance> {
        let app = ctx.data_unchecked::<LavaApp>();
        let balance = app.ledger().get_user_balance(self.account_ids).await?;
        Ok(UserBalance::from(balance))
    }

    async fn loans(&self, ctx: &Context<'_>) -> async_graphql::Result<Vec<FixedTermLoan>> {
        let app = ctx.data_unchecked::<LavaApp>();

        let loans: Vec<FixedTermLoan> = app
            .fixed_term_loans()
            .list_for_user(UserId::from(&self.user_id))
            .await?
            .into_iter()
            .map(FixedTermLoan::from)
            .collect();

        Ok(loans)
    }
}

impl From<crate::user::User> for User {
    fn from(user: crate::user::User) -> Self {
        User {
            user_id: UUID::from(user.id),
            btc_deposit_address: user.account_addresses.btc_address,
            ust_deposit_address: user.account_addresses.tron_usdt_address,
            email: user.email,
            account_ids: user.account_ids,
        }
    }
}

#[derive(SimpleObject)]
pub struct Withdrawal {
    user_id: UUID,
    withdrawal_id: UUID,
    amount: UsdCents,
}

impl From<crate::withdraw::Withdraw> for Withdrawal {
    fn from(withdraw: crate::withdraw::Withdraw) -> Self {
        Withdrawal {
            withdrawal_id: UUID::from(withdraw.id),
            user_id: UUID::from(withdraw.user_id),
            amount: withdraw.amount,
        }
    }
}

#[derive(SimpleObject)]
struct UnallocatedCollateral {
    settled: BtcBalance,
}

#[derive(SimpleObject)]
struct Checking {
    settled: UsdBalance,
    pending: UsdBalance,
}

#[derive(SimpleObject)]
struct UserBalance {
    unallocated_collateral: UnallocatedCollateral,
    checking: Checking,
}

impl From<ledger::user::UserBalance> for UserBalance {
    fn from(balance: ledger::user::UserBalance) -> Self {
        Self {
            unallocated_collateral: UnallocatedCollateral {
                settled: BtcBalance {
                    btc_balance: balance.btc_balance,
                },
            },
            checking: Checking {
                settled: UsdBalance {
                    usd_balance: balance.usdt_balance.settled,
                },
                pending: UsdBalance {
                    usd_balance: balance.usdt_balance.pending,
                },
            },
        }
    }
}
