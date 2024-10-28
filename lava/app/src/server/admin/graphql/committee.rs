use async_graphql::{dataloader::DataLoader, *};
use chrono::{DateTime, Utc};
use connection::CursorType;
use serde::{Deserialize, Serialize};

use crate::{
    primitives::{CommitteeId, UserId},
    server::shared_graphql::{
        convert::ToGlobalId,
        primitives::{Timestamp, UUID},
    },
};

use super::{user::User, LavaDataLoader};

#[derive(SimpleObject)]
#[graphql(complex)]
pub struct Committee {
    id: ID,
    committee_id: UUID,
    #[graphql(skip)]
    user_ids: Vec<UUID>,
    created_at: Timestamp,
    name: String,
}

#[ComplexObject]
impl Committee {
    async fn users(&self, ctx: &Context<'_>) -> async_graphql::Result<Vec<User>> {
        let loader = ctx.data_unchecked::<DataLoader<LavaDataLoader>>();
        let users = loader
            .load_many(self.user_ids.iter().map(UserId::from))
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
            user_ids: committee.members().iter().map(|user| user.into()).collect(),
            created_at: committee.created_at().into(),
            name: committee.name,
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

#[derive(Serialize, Deserialize)]
pub(super) struct CommitteeByCreatedAtCursor {
    pub id: CommitteeId,
    pub created_at: DateTime<Utc>,
}

impl CursorType for CommitteeByCreatedAtCursor {
    type Error = String;

    fn encode_cursor(&self) -> String {
        use base64::{engine::general_purpose, Engine as _};
        let json = serde_json::to_string(&self).expect("could not serialize token");
        general_purpose::STANDARD_NO_PAD.encode(json.as_bytes())
    }

    fn decode_cursor(s: &str) -> Result<Self, Self::Error> {
        use base64::{engine::general_purpose, Engine as _};
        let bytes = general_purpose::STANDARD_NO_PAD
            .decode(s.as_bytes())
            .map_err(|e| e.to_string())?;
        let json = String::from_utf8(bytes).map_err(|e| e.to_string())?;
        serde_json::from_str(&json).map_err(|e| e.to_string())
    }
}

impl From<(CommitteeId, DateTime<Utc>)> for CommitteeByCreatedAtCursor {
    fn from((id, created_at): (CommitteeId, DateTime<Utc>)) -> Self {
        Self { id, created_at }
    }
}

impl From<CommitteeByCreatedAtCursor> for governance::committee_cursor::CommitteeByCreatedAtCursor {
    fn from(cursor: CommitteeByCreatedAtCursor) -> Self {
        Self {
            id: cursor.id,
            created_at: cursor.created_at,
        }
    }
}
