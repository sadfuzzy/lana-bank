mod committee;
pub mod error;
mod process_assignment;

use tracing::instrument;

use crate::{
    audit::Audit,
    authorization::{Authorization, CommitteeAction, Object, ProcessAssignmentAction},
    data_export::Export,
    primitives::*,
};

pub use committee::*;
use error::*;
pub use process_assignment::*;

#[derive(Clone)]
pub struct Governance {
    pool: sqlx::PgPool,
    committee_repo: CommitteeRepo,
    process_assignment_repo: ProcessAssignmentRepo,
    audit: Audit,
    authz: Authorization,
}

impl Governance {
    pub async fn init(
        pool: &sqlx::PgPool,
        authz: &Authorization,
        audit: &Audit,
        export: &Export,
    ) -> Result<Self, GovernanceError> {
        let committee_repo = CommitteeRepo::new(pool, export);
        let process_assignment_repo = ProcessAssignmentRepo::new(pool, export);

        let governance = Self {
            pool: pool.clone(),
            committee_repo,
            process_assignment_repo,
            audit: audit.clone(),
            authz: authz.clone(),
        };

        governance.init_process_assignment().await?;

        Ok(governance)
    }

    async fn init_process_assignment(&self) -> Result<(), GovernanceError> {
        self.init_credit_facility_approval_process_assignment()
            .await?;
        self.init_credit_facility_disbursement_process_assignment()
            .await?;
        Ok(())
    }

    async fn init_credit_facility_approval_process_assignment(
        &self,
    ) -> Result<(), GovernanceError> {
        if self
            .process_assignment_repo
            .find_by_approval_process_type(ApprovalProcessType::CreditFacilityApproval)
            .await
            .is_ok()
        {
            return Ok(());
        }

        let sub = Subject::System(SystemNode::Init);
        let audit_info = self
            .audit
            .record_entry(
                &sub,
                Object::ProcessAssignment,
                ProcessAssignmentAction::Init,
                true,
            )
            .await?;

        let new_process_assignment = NewProcessAssignment::builder()
            .id(ProcessAssignmentId::new())
            .approval_process_type(ApprovalProcessType::CreditFacilityApproval)
            .audit_info(audit_info)
            .build()
            .expect("Could not build new process assignment");

        let mut db = self.pool.begin().await?;
        self.process_assignment_repo
            .create_in_tx(&mut db, new_process_assignment)
            .await?;
        db.commit().await?;

        Ok(())
    }

    async fn init_credit_facility_disbursement_process_assignment(
        &self,
    ) -> Result<(), GovernanceError> {
        if self
            .process_assignment_repo
            .find_by_approval_process_type(ApprovalProcessType::CreditFacilityDisbursement)
            .await
            .is_ok()
        {
            return Ok(());
        }

        let sub = Subject::System(SystemNode::Init);
        let audit_info = self
            .audit
            .record_entry(
                &sub,
                Object::ProcessAssignment,
                ProcessAssignmentAction::Init,
                true,
            )
            .await?;

        let new_process_assignment = NewProcessAssignment::builder()
            .id(ProcessAssignmentId::new())
            .approval_process_type(ApprovalProcessType::CreditFacilityDisbursement)
            .audit_info(audit_info)
            .build()
            .expect("Could not build new process assignment");

        let mut db = self.pool.begin().await?;
        self.process_assignment_repo
            .create_in_tx(&mut db, new_process_assignment)
            .await?;
        db.commit().await?;

        Ok(())
    }

    #[instrument(name = "lava.governance.update_committee", skip(self), err)]
    pub async fn update_committee(
        &self,
        sub: &Subject,
        process_assignment_id: impl Into<ProcessAssignmentId> + std::fmt::Debug,
        committee_id: impl Into<CommitteeId> + std::fmt::Debug,
    ) -> Result<ProcessAssignment, GovernanceError> {
        let audit_info = self
            .authz
            .evaluate_permission(
                sub,
                Object::ProcessAssignment,
                ProcessAssignmentAction::UpdateCommittee,
                true,
            )
            .await?
            .expect("audit info missing");

        let mut process_assignment = self
            .process_assignment_repo
            .find_by_id(process_assignment_id.into())
            .await?;

        process_assignment.update_committee(committee_id.into(), audit_info);

        self.process_assignment_repo
            .update(&mut process_assignment)
            .await?;

        Ok(process_assignment)
    }

    #[instrument(name = "lava.governance.create_committee", skip(self), err)]
    pub async fn create_committee(
        &self,
        sub: &Subject,
        name: String,
    ) -> Result<Committee, GovernanceError> {
        let audit_info = self
            .authz
            .evaluate_permission(sub, Object::Committee, CommitteeAction::Create, true)
            .await?
            .expect("audit info missing");

        let new_committee = NewCommittee::builder()
            .id(CommitteeId::new())
            .name(name)
            .audit_info(audit_info)
            .build()
            .expect("Could not build new committee");

        let mut db = self.pool.begin().await?;
        let committee = self
            .committee_repo
            .create_in_tx(&mut db, new_committee)
            .await?;
        db.commit().await?;
        Ok(committee)
    }

    #[instrument(name = "lava.governance.add_user_to_committee", skip(self), err)]
    pub async fn add_user_to_committee(
        &self,
        sub: &Subject,
        committee_id: impl Into<CommitteeId> + std::fmt::Debug,
        user_id: impl Into<UserId> + std::fmt::Debug,
    ) -> Result<Committee, GovernanceError> {
        let audit_info = self
            .authz
            .evaluate_permission(sub, Object::Committee, CommitteeAction::AddUser, true)
            .await?
            .expect("audit info missing");

        let mut committee = self.committee_repo.find_by_id(committee_id.into()).await?;

        committee.add_user(user_id.into(), audit_info);

        self.committee_repo.update(&mut committee).await?;

        Ok(committee)
    }

    #[instrument(name = "lava.governance.remove_user_from_committee", skip(self), err)]
    pub async fn remove_user_from_committee(
        &self,
        sub: &Subject,
        committee_id: impl Into<CommitteeId> + std::fmt::Debug,
        user_id: impl Into<UserId> + std::fmt::Debug,
    ) -> Result<Committee, GovernanceError> {
        let audit_info = self
            .authz
            .evaluate_permission(sub, Object::Committee, CommitteeAction::RemoveUser, true)
            .await?
            .expect("audit info missing");

        let mut committee = self.committee_repo.find_by_id(committee_id.into()).await?;

        committee.remove_user(user_id.into(), audit_info);

        self.committee_repo.update(&mut committee).await?;

        Ok(committee)
    }

    #[instrument(name = "lava.governance.find_committee_by_id", skip(self), err)]
    pub async fn find_committee_by_id_internal(
        &self,
        committee_id: CommitteeId,
    ) -> Result<Committee, GovernanceError> {
        let committee = self.committee_repo.find_by_id(committee_id).await?;
        Ok(committee)
    }
}
