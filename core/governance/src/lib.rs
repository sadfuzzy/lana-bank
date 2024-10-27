#![cfg_attr(feature = "fail-on-warnings", deny(warnings))]
#![cfg_attr(feature = "fail-on-warnings", deny(clippy::all))]

mod approval_process;
mod committee;
pub mod error;
mod event;
mod policy;
mod primitives;

use tracing::instrument;

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

    #[instrument(name = "governance.create_policy", skip(self), err)]
    pub async fn create_policy(
        &self,
        db: &mut sqlx::Transaction<'_, sqlx::Postgres>,
        sub: &<<Perms as PermissionCheck>::Audit as AuditSvc>::Subject,
        process_type: ApprovalProcessType,
        rules: ApprovalRules,
        committee_id: Option<CommitteeId>,
    ) -> Result<Policy, GovernanceError> {
        let audit_info = self
            .authz
            .evaluate_permission(
                sub,
                GovernanceObject::Policy(PolicyAllOrOne::All),
                g_action(PolicyAction::Create),
                true,
            )
            .await?
            .expect("audit info missing");

        let new_policy = NewPolicy::builder()
            .id(PolicyId::new())
            .process_type(process_type)
            .committee_id(committee_id)
            .rules(rules)
            .audit_info(audit_info)
            .build()
            .expect("Could not build new policy");

        let policy = self.policy_repo.create_in_tx(db, new_policy).await?;
        Ok(policy)
    }

    pub async fn start_process(
        &self,
        db: &mut sqlx::Transaction<'_, sqlx::Postgres>,
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
        let process = policy.spawn_process(audit_info);
        let process = self.process_repo.create_in_tx(db, process).await?;
        self.outbox
            .persist(
                db,
                GovernanceEvent::ApprovalProcessConcluded {
                    id: process.id,
                    approved: false,
                },
            )
            .await?;
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
}
