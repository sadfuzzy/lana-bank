use async_graphql::*;

use crate::server::shared_graphql::{
    primitives::UUID,
    user::{Role, User},
};

#[derive(InputObject)]
pub struct UserCreateInput {
    pub email: String,
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
pub struct UserAssignRoleInput {
    pub id: UUID,
    pub role: Role,
}

#[derive(SimpleObject)]
pub struct UserAssignRolePayload {
    user: User,
}

impl From<crate::user::User> for UserAssignRolePayload {
    fn from(user: crate::user::User) -> Self {
        Self {
            user: User::from(user),
        }
    }
}

#[derive(InputObject)]
pub struct UserRevokeRoleInput {
    pub id: UUID,
    pub role: Role,
}

#[derive(SimpleObject)]
pub struct UserRevokeRolePayload {
    user: User,
}

impl From<crate::user::User> for UserRevokeRolePayload {
    fn from(user: crate::user::User) -> Self {
        Self {
            user: User::from(user),
        }
    }
}
