use async_graphql::*;

use crate::{
    app::LavaApp,
    primitives::UserId,
    server::{admin::AdminAuthContext, shared_graphql::primitives::UUID},
};

#[derive(SimpleObject)]
#[graphql(complex)]
pub struct User {
    user_id: UUID,
    email: String,
}

#[ComplexObject]
impl User {
    async fn roles(&self, ctx: &Context<'_>) -> async_graphql::Result<Vec<Role>> {
        let app = ctx.data_unchecked::<LavaApp>();
        let AdminAuthContext { sub } = ctx.data()?;

        let roles = app
            .users()
            .roles_for_user(sub, UserId::from(&self.user_id))
            .await?;
        Ok(roles.into_iter().map(|r| r.into()).collect())
    }
}

impl From<crate::user::User> for User {
    fn from(user: crate::user::User) -> Self {
        Self {
            user_id: UUID::from(user.id),
            email: user.email,
        }
    }
}

#[derive(Enum, Copy, Clone, Eq, PartialEq)]
#[graphql(remote = "crate::primitives::Role")]
pub enum Role {
    Superuser,
    BankManager,
}
