use async_graphql::*;

use crate::{app::LavaApp, primitives::LedgerAccountId};

use super::{account::*, primitives::UUID};

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
    ledger_account_id: LedgerAccountId,
}

#[ComplexObject]
impl User {
    async fn deposit_account(&self, ctx: &Context<'_>) -> async_graphql::Result<DepositAccount> {
        let app = ctx.data_unchecked::<LavaApp>();
        let account = app
            .ledger()
            .get_account_by_id(self.ledger_account_id)
            .await?;
        Ok(DepositAccount::from(account))
    }
}

impl From<crate::user::User> for User {
    fn from(user: crate::user::User) -> Self {
        User {
            user_id: UUID::from(user.id),
            bitfinex_username: user.bitfinex_username,
            ledger_account_id: user.ledger_account_id,
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
