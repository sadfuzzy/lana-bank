use async_graphql::*;

use crate::{
    app::LavaApp,
    ledger::user::UserLedgerAccountIds,
    primitives::{Satoshis, UsdCents},
    server::shared::primitives::UUID,
};

use super::user_balance::*;

#[derive(InputObject)]
pub struct UserCreateInput {
    pub bitfinex_username: String,
}

#[derive(SimpleObject)]
#[graphql(complex)]
pub struct User {
    user_id: UUID,
    bitfinex_username: String,
    #[graphql(skip)]
    account_ids: UserLedgerAccountIds,
}

#[ComplexObject]
impl User {
    async fn balance(&self, ctx: &Context<'_>) -> async_graphql::Result<UserBalance> {
        let app = ctx.data_unchecked::<LavaApp>();
        let balance = app.ledger().get_user_balance(self.account_ids).await?;
        Ok(UserBalance::from(balance))
    }
}

impl From<crate::user::User> for User {
    fn from(user: crate::user::User) -> Self {
        User {
            user_id: UUID::from(user.id),
            bitfinex_username: user.bitfinex_username,
            account_ids: user.account_ids,
        }
    }
}

#[derive(SimpleObject)]
pub struct UserCreatePayload {
    user: User,
}

impl From<crate::user::User> for UserCreatePayload {
    fn from(user: crate::user::User) -> Self {
        Self {
            user: User::from(user),
        }
    }
}

#[derive(InputObject)]
pub struct UserTopupCollateralInput {
    pub user_id: UUID,
    pub amount: Satoshis,
    pub reference: String,
}

#[derive(SimpleObject)]
pub struct UserTopupCollateralPayload {
    pub user: User,
}

impl From<crate::user::User> for UserTopupCollateralPayload {
    fn from(user: crate::user::User) -> Self {
        Self {
            user: User::from(user),
        }
    }
}

#[derive(SimpleObject)]
pub struct Withdraw {
    id: UUID,
    user_id: UUID,
}

impl From<crate::withdraw::Withdraw> for Withdraw {
    fn from(withdraw: crate::withdraw::Withdraw) -> Self {
        Withdraw {
            id: UUID::from(withdraw.id),
            user_id: UUID::from(withdraw.user_id),
        }
    }
}

#[derive(InputObject)]
pub struct WithdrawInitiateInput {
    pub user_id: UUID,
    pub amount: UsdCents,
    pub destination: String,
    pub reference: String,
}

#[derive(SimpleObject)]
pub struct WithdrawInitiatePayload {
    pub withdraw: Withdraw,
}

impl From<crate::withdraw::Withdraw> for WithdrawInitiatePayload {
    fn from(withdraw: crate::withdraw::Withdraw) -> Self {
        Self {
            withdraw: Withdraw::from(withdraw),
        }
    }
}

#[derive(InputObject)]
pub struct WithdrawSettleInput {
    pub withdrawal_id: UUID,
    pub reference: String,
}

#[derive(SimpleObject)]
pub struct WithdrawSettlePayload {
    pub withdraw: Withdraw,
}

impl From<crate::withdraw::Withdraw> for WithdrawSettlePayload {
    fn from(withdraw: crate::withdraw::Withdraw) -> Self {
        Self {
            withdraw: Withdraw::from(withdraw),
        }
    }
}
