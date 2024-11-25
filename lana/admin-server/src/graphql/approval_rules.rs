use async_graphql::*;

use super::{committee::Committee, loader::LanaDataLoader};

#[derive(async_graphql::Union)]
pub(super) enum ApprovalRules {
    System(SystemApproval),
    CommitteeThreshold(CommitteeThreshold),
}

impl From<governance::ApprovalRules> for ApprovalRules {
    fn from(rules: governance::ApprovalRules) -> Self {
        match rules {
            governance::ApprovalRules::CommitteeThreshold {
                threshold,
                committee_id,
            } => ApprovalRules::CommitteeThreshold(CommitteeThreshold {
                threshold,
                committee_id,
            }),
            governance::ApprovalRules::SystemAutoApprove => {
                ApprovalRules::System(SystemApproval { auto_approve: true })
            }
        }
    }
}

#[derive(SimpleObject)]
pub(super) struct SystemApproval {
    auto_approve: bool,
}

#[derive(SimpleObject)]
#[graphql(complex)]
pub(super) struct CommitteeThreshold {
    threshold: usize,
    #[graphql(skip)]
    committee_id: governance::CommitteeId,
}

#[ComplexObject]
impl CommitteeThreshold {
    async fn committee(&self, ctx: &Context<'_>) -> async_graphql::Result<Committee> {
        let loader = ctx.data_unchecked::<LanaDataLoader>();
        let committee = loader
            .load_one(self.committee_id)
            .await?
            .expect("committee not found");
        Ok(committee)
    }
}
