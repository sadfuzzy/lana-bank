#![cfg_attr(feature = "fail-on-warnings", deny(warnings))]
#![cfg_attr(feature = "fail-on-warnings", deny(clippy::all))]

mod approval_process;
mod committee;
pub mod error;
mod event;
mod policy;
mod primitives;

use sqlx::Acquire;
use tracing::instrument;

use std::collections::HashSet;

use audit::{AuditSvc, SystemSubject};
use authz::PermissionCheck;
use outbox::Outbox;

pub use approval_process::*;
pub use committee::*;
use error::*;
pub use event::*;
pub use policy::*;
pub use primitives::*;

pub struct Governance<Perms, E>
where
    Perms: PermissionCheck,
    E: serde::de::DeserializeOwned + serde::Serialize + Send + Sync + 'static + Unpin,
{
    pool: sqlx::PgPool,
    committee_repo: CommitteeRepo,
    policy_repo: PolicyRepo,
    process_repo: ApprovalProcessRepo,
    authz: Perms,
    outbox: Outbox<E>,
}

impl<Perms, E> Clone for Governance<Perms, E>
where
    Perms: PermissionCheck,
    E: serde::de::DeserializeOwned + serde::Serialize + Send + Sync + 'static + Unpin,
{
    fn clone(&self) -> Self {
        Self {
            pool: self.pool.clone(),
            committee_repo: self.committee_repo.clone(),
            policy_repo: self.policy_repo.clone(),
            process_repo: self.process_repo.clone(),
            authz: self.authz.clone(),
            outbox: self.outbox.clone(),
        }
    }
}

impl<Perms, E> Governance<Perms, E>
where
    Perms: PermissionCheck,
    <<Perms as PermissionCheck>::Audit as AuditSvc>::Subject: audit::SystemSubject,
    <<Perms as PermissionCheck>::Audit as AuditSvc>::Action: From<GovernanceAction>,
    <<Perms as PermissionCheck>::Audit as AuditSvc>::Object: From<GovernanceObject>,
    E: serde::de::DeserializeOwned
        + serde::Serialize
        + Send
        + Sync
        + 'static
        + Unpin
        + From<GovernanceEvent>,
{
    pub fn new(pool: &sqlx::PgPool, authz: &Perms, outbox: &Outbox<E>) -> Self {
        let committee_repo = CommitteeRepo::new(pool);
        let policy_repo = PolicyRepo::new(pool);
        let process_repo = ApprovalProcessRepo::new(pool);

        Self {
            pool: pool.clone(),
            committee_repo,
            policy_repo,
            process_repo,
            authz: authz.clone(),
            outbox: outbox.clone(),
        }
    }

    #[instrument(name = "governance.init_policy", skip(self), err)]
    pub async fn init_policy(
        &self,
        process_type: ApprovalProcessType,
    ) -> Result<Policy, GovernanceError> {
        let sub = <<Perms as PermissionCheck>::Audit as AuditSvc>::Subject::system();
        let audit_info = self
            .authz
            .audit()
            .record_entry(
                &sub,
                GovernanceObject::Policy(PolicyAllOrOne::All),
                g_action(PolicyAction::Create),
                true,
            )
            .await?;

        let new_policy = NewPolicy::builder()
            .id(PolicyId::new())
            .process_type(process_type)
            .rules(ApprovalRules::Automatic)
            .audit_info(audit_info)
            .build()
            .expect("Could not build new policy");

        let policy = self.policy_repo.create(new_policy).await?;
        Ok(policy)
    }

    #[instrument(name = "governance.start_process", skip(self), err)]
    pub async fn start_process(
        &self,
        db: &mut sqlx::Transaction<'_, sqlx::Postgres>,
        id: impl Into<ApprovalProcessId> + std::fmt::Debug,
        process_type: ApprovalProcessType,
    ) -> Result<ApprovalProcess, GovernanceError> {
        let sub = <<Perms as PermissionCheck>::Audit as AuditSvc>::Subject::system();
        let policy = self.policy_repo.find_by_process_type(process_type).await?;
        let audit_info = self
            .authz
            .audit()
            .record_entry(
                &sub,
                GovernanceObject::Policy(PolicyAllOrOne::All),
                g_action(PolicyAction::Create),
                true,
            )
            .await?;
        let process = policy.spawn_process(id.into(), audit_info);
        let mut process = self.process_repo.create_in_tx(db, process).await?;
        if self
            .maybe_fire_concluded_event(db.begin().await?, HashSet::new(), &mut process)
            .await?
        {
            self.process_repo.update_in_tx(db, &mut process).await?;
        }
        Ok(process)
    }

    #[instrument(name = "governance.approve_process", skip(self), err)]
    pub async fn approve_process(
        &self,
        sub: &<<Perms as PermissionCheck>::Audit as AuditSvc>::Subject,
        process_id: ApprovalProcessId,
    ) -> Result<ApprovalProcess, GovernanceError>
    where
        UserId: for<'a> From<&'a <<Perms as PermissionCheck>::Audit as AuditSvc>::Subject>,
    {
        let audit_info = self
            .authz
            .evaluate_permission(
                sub,
                GovernanceObject::ApprovalProcess(ApprovalProcessAllOrOne::ById(process_id)),
                GovernanceAction::ApprovalProcess(ApprovalProcessAction::Approve),
                true,
            )
            .await?
            .expect("audit info missing");
        let user_id = UserId::from(sub);
        let mut process = self.process_repo.find_by_id(process_id).await?;
        let eligible = if let Some(committee_id) = process.committee_id {
            self.committee_repo
                .find_by_id(committee_id)
                .await?
                .members()
        } else {
            HashSet::new()
        };
        process.approve(&eligible, user_id, audit_info)?;
        let mut db = self.pool.begin().await?;
        self.maybe_fire_concluded_event(db.begin().await?, eligible, &mut process)
            .await?;
        self.process_repo
            .update_in_tx(&mut db, &mut process)
            .await?;
        db.commit().await?;

        Ok(process)
    }

    #[instrument(name = "governance.deny_process", skip(self), err)]
    pub async fn deny_process(
        &self,
        sub: &<<Perms as PermissionCheck>::Audit as AuditSvc>::Subject,
        process_id: ApprovalProcessId,
    ) -> Result<ApprovalProcess, GovernanceError>
    where
        UserId: for<'a> From<&'a <<Perms as PermissionCheck>::Audit as AuditSvc>::Subject>,
    {
        let audit_info = self
            .authz
            .evaluate_permission(
                sub,
                GovernanceObject::ApprovalProcess(ApprovalProcessAllOrOne::ById(process_id)),
                GovernanceAction::ApprovalProcess(ApprovalProcessAction::Deny),
                true,
            )
            .await?
            .expect("audit info missing");
        let user_id = UserId::from(sub);
        let mut process = self.process_repo.find_by_id(process_id).await?;
        let eligible = if let Some(committee_id) = process.committee_id {
            self.committee_repo
                .find_by_id(committee_id)
                .await?
                .members()
        } else {
            HashSet::new()
        };
        process.deny(&eligible, user_id, audit_info)?;
        let mut db = self.pool.begin().await?;
        self.maybe_fire_concluded_event(db.begin().await?, eligible, &mut process)
            .await?;
        self.process_repo
            .update_in_tx(&mut db, &mut process)
            .await?;
        db.commit().await?;

        Ok(process)
    }

    #[instrument(name = "governance.create_committee", skip(self), err)]
    pub async fn create_committee(
        &self,
        sub: &<<Perms as PermissionCheck>::Audit as AuditSvc>::Subject,
        name: String,
    ) -> Result<Committee, GovernanceError> {
        let audit_info = self
            .authz
            .evaluate_permission(
                sub,
                GovernanceObject::Committee(CommitteeAllOrOne::All),
                g_action(CommitteeAction::Create),
                true,
            )
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

    async fn maybe_fire_concluded_event(
        &self,
        mut db: sqlx::Transaction<'_, sqlx::Postgres>,
        eligible: HashSet<UserId>,
        process: &mut ApprovalProcess,
    ) -> Result<bool, GovernanceError> {
        let audit_info = self
            .authz
            .audit()
            .record_system_entry_in_tx(
                &mut db,
                GovernanceObject::ApprovalProcess(ApprovalProcessAllOrOne::ById(process.id)),
                GovernanceAction::ApprovalProcess(ApprovalProcessAction::Conclude),
            )
            .await?;
        let res = if let Some(approved) = process.check_concluded(eligible, audit_info) {
            self.outbox
                .persist(
                    &mut db,
                    GovernanceEvent::ApprovalProcessConcluded {
                        id: process.id,
                        approved,
                    },
                )
                .await?;
            db.commit().await?;
            true
        } else {
            false
        };
        Ok(res)
    }
}
