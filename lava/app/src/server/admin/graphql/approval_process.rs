use async_graphql::{dataloader::DataLoader, *};
use chrono::{DateTime, Utc};
use connection::CursorType;
use serde::{Deserialize, Serialize};

use crate::{
    primitives::ApprovalProcessId,
    server::shared_graphql::{
        convert::ToGlobalId,
        primitives::{Timestamp, UUID},
    },
};

use super::{committee::Committee, LavaDataLoader};

#[derive(SimpleObject)]
#[graphql(complex)]
pub struct ApprovalProcess {
    id: ID,
    approval_process_id: UUID,
    #[graphql(skip)]
    committee_id: Option<governance::CommitteeId>,
    process_type: String,
    created_at: Timestamp,
}

#[ComplexObject]
impl ApprovalProcess {
    async fn committee(&self, ctx: &Context<'_>) -> async_graphql::Result<Option<Committee>> {
        let loader = ctx.data_unchecked::<DataLoader<LavaDataLoader>>();
        if let Some(committee_id) = self.committee_id {
            let committee = loader.load_one(committee_id).await?.map(Committee::from);
            Ok(committee)
        } else {
            Ok(None)
        }
    }
}

impl ToGlobalId for ApprovalProcessId {
    fn to_global_id(&self) -> async_graphql::types::ID {
        async_graphql::types::ID::from(format!("approval_process:{}", self))
    }
}

impl From<governance::ApprovalProcess> for ApprovalProcess {
    fn from(process: governance::ApprovalProcess) -> Self {
        Self {
            id: process.id.to_global_id(),
            approval_process_id: process.id.into(),
            committee_id: process.committee_id.map(Into::into),
            process_type: process.process_type.to_string(),
            created_at: process.created_at().into(),
        }
    }
}

// #[derive(InputObject)]
// pub struct ApprovalProcessApprove {}

#[derive(SimpleObject)]
pub struct ApprovalProcessApprovePayload {
    pub approval_process: ApprovalProcess,
}

impl From<governance::ApprovalProcess> for ApprovalProcessApprovePayload {
    fn from(process: governance::ApprovalProcess) -> Self {
        Self {
            approval_process: process.into(),
        }
    }
}

// #[derive(InputObject)]
// pub struct ApprovalProcessRemoveUserInput {
//     pub committee_id: UUID,
//     pub user_id: UUID,
// }

// #[derive(SimpleObject)]
// pub struct ApprovalProcessRemoveUserPayload {
//     pub committee: ApprovalProcess,
// }

// impl From<governance::ApprovalProcess> for ApprovalProcessRemoveUserPayload {
//     fn from(committee: governance::ApprovalProcess) -> Self {
//         Self {
//             committee: committee.into(),
//         }
//     }
// }

#[derive(Serialize, Deserialize)]
pub(super) struct ApprovalProcessByCreatedAtCursor {
    pub id: ApprovalProcessId,
    pub created_at: DateTime<Utc>,
}

impl CursorType for ApprovalProcessByCreatedAtCursor {
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

impl From<(ApprovalProcessId, DateTime<Utc>)> for ApprovalProcessByCreatedAtCursor {
    fn from((id, created_at): (ApprovalProcessId, DateTime<Utc>)) -> Self {
        Self { id, created_at }
    }
}

impl From<ApprovalProcessByCreatedAtCursor>
    for governance::approval_process_cursor::ApprovalProcessByCreatedAtCursor
{
    fn from(cursor: ApprovalProcessByCreatedAtCursor) -> Self {
        Self {
            id: cursor.id,
            created_at: cursor.created_at,
        }
    }
}
