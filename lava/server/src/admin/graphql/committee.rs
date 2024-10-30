use async_graphql::{dataloader::DataLoader, *};

use std::sync::Arc;

use crate::shared_graphql::{
    convert::ToGlobalId,
    primitives::{Timestamp, UUID},
};
use lava_app::primitives::CommitteeId;

use super::{user::User, LavaDataLoader};

pub use governance::{committee_cursor::CommitteeByCreatedAtCursor, Committee as DomainCommittee};

#[derive(Clone, SimpleObject)]
#[graphql(complex)]
pub struct Committee {
    id: ID,
    committee_id: UUID,
    created_at: Timestamp,
    #[graphql(skip)]
    pub(super) entity: Arc<DomainCommittee>,
}

#[ComplexObject]
impl Committee {
    async fn name(&self) -> &str {
        &self.entity.name
    }

    async fn current_members(&self, ctx: &Context<'_>) -> async_graphql::Result<Vec<User>> {
        let loader = ctx.data_unchecked::<DataLoader<LavaDataLoader>>();
        let users = loader
            .load_many(self.entity.members().into_iter())
            .await?
            .into_values()
            .map(User::from)
            .collect();

        Ok(users)
    }
}

impl ToGlobalId for CommitteeId {
    fn to_global_id(&self) -> async_graphql::types::ID {
        async_graphql::types::ID::from(format!("committee:{}", self))
    }
}

impl From<governance::Committee> for Committee {
    fn from(committee: governance::Committee) -> Self {
        Self {
            id: committee.id.to_global_id(),
            committee_id: committee.id.into(),
            created_at: committee.created_at().into(),
            entity: Arc::new(committee),
        }
    }
}

#[derive(InputObject)]
pub struct CommitteeCreateInput {
    pub name: String,
}

#[derive(SimpleObject)]
pub struct CommitteeCreatePayload {
    pub committee: Committee,
}

impl From<governance::Committee> for CommitteeCreatePayload {
    fn from(committee: governance::Committee) -> Self {
        Self {
            committee: committee.into(),
        }
    }
}

#[derive(InputObject)]
pub struct CommitteeAddUserInput {
    pub committee_id: UUID,
    pub user_id: UUID,
}

#[derive(SimpleObject)]
pub struct CommitteeAddUserPayload {
    pub committee: Committee,
}

impl From<governance::Committee> for CommitteeAddUserPayload {
    fn from(committee: governance::Committee) -> Self {
        Self {
            committee: committee.into(),
        }
    }
}

#[derive(InputObject)]
pub struct CommitteeRemoveUserInput {
    pub committee_id: UUID,
    pub user_id: UUID,
}

#[derive(SimpleObject)]
pub struct CommitteeRemoveUserPayload {
    pub committee: Committee,
}

impl From<governance::Committee> for CommitteeRemoveUserPayload {
    fn from(committee: governance::Committee) -> Self {
        Self {
            committee: committee.into(),
        }
    }
}
