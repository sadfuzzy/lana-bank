use async_graphql::*;

use super::primitives::UUID;

#[derive(InputObject)]
pub struct UserCreateInput {
    pub bitfinex_username: String,
}

#[derive(SimpleObject)]
pub struct User {
    user_id: UUID,
    bitfinex_username: String,
}

impl From<crate::user::User> for User {
    fn from(user: crate::user::User) -> Self {
        User {
            user_id: UUID::from(user.id),
            bitfinex_username: user.bitfinex_username,
        }
    }
}
