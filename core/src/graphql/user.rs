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
    unallocated_collateral_ledger_account_id: LedgerAccountId,
}

#[ComplexObject]
impl User {
    async fn unallocated_collateral(
        &self,
        ctx: &Context<'_>,
    ) -> async_graphql::Result<UnallocatedCollateral> {
        let app = ctx.data_unchecked::<LavaApp>();
        let account = app
            .ledger()
            .get_account_by_id(self.unallocated_collateral_ledger_account_id)
            .await?;
        Ok(UnallocatedCollateral::from(account))
    }
}

impl From<crate::user::User> for User {
    fn from(user: crate::user::User) -> Self {
        User {
            user_id: UUID::from(user.id),
            bitfinex_username: user.bitfinex_username,
            unallocated_collateral_ledger_account_id: user.unallocated_collateral_ledger_account_id,
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
