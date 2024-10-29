use async_graphql::*;

use crate::{
    primitives::ApprovalProcessId,
    server::shared_graphql::{
        convert::ToGlobalId,
        primitives::{Timestamp, UUID},
    },
};

use super::policy::ApprovalRules;

pub use governance::approval_process_cursor::ApprovalProcessByCreatedAtCursor;

#[derive(SimpleObject)]
pub struct ApprovalProcess {
    id: ID,
    approval_process_id: UUID,
    rules: ApprovalRules,
    process_type: String,
    created_at: Timestamp,
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
            process_type: process.process_type.to_string(),
            created_at: process.created_at().into(),
            rules: process.rules.into(),
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
