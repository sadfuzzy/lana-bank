mod job;

use governance::{ApprovalProcess, ApprovalProcessStatus, ApprovalProcessType};

use crate::{
    audit::{Audit, AuditSvc},
    governance::Governance,
    primitives::WithdrawId,
    withdraw::{error::WithdrawError, repo::WithdrawRepo, Withdraw},
};
use rbac_types::{AppObject, WithdrawAction};

pub use job::*;

pub const APPROVE_WITHDRAW_PROCESS: ApprovalProcessType = ApprovalProcessType::new("withdraw");

#[derive(Clone)]
pub struct ApproveWithdraw {
    repo: WithdrawRepo,
    audit: Audit,
    governance: Governance,
}

impl ApproveWithdraw {
    pub fn new(repo: &WithdrawRepo, audit: &Audit, governance: &Governance) -> Self {
        Self {
            repo: repo.clone(),
            audit: audit.clone(),
            governance: governance.clone(),
        }
    }

    pub async fn execute_from_svc(
        &self,
        withdraw: &Withdraw,
    ) -> Result<Option<Withdraw>, WithdrawError> {
        if withdraw.is_approved_or_denied().is_some() {
            return Ok(None);
        }

        let process: ApprovalProcess = self
            .governance
            .find_all_approval_processes(&[withdraw.approval_process_id])
            .await?
            .remove(&withdraw.approval_process_id)
            .expect("approval process not found");

        let res = match process.status() {
            ApprovalProcessStatus::Approved => Some(self.execute(withdraw.id, true).await?),
            ApprovalProcessStatus::Denied => Some(self.execute(withdraw.id, false).await?),
            _ => None,
        };
        Ok(res)
    }

    #[es_entity::retry_on_concurrent_modification]
    pub async fn execute(
        &self,
        id: impl es_entity::RetryableInto<WithdrawId>,
        approved: bool,
    ) -> Result<Withdraw, WithdrawError> {
        let mut withdraw = self.repo.find_by_id(id.into()).await?;
        if withdraw.is_approved_or_denied().is_some() {
            return Ok(withdraw);
        }
        let mut db = self.repo.pool().begin().await?;
        let audit_info = self
            .audit
            .record_system_entry_in_tx(
                &mut db,
                AppObject::Withdraw,
                WithdrawAction::ConcludeApprovalProcess,
            )
            .await?;
        if withdraw
            .approval_process_concluded(approved, audit_info)
            .did_execute()
        {
            self.repo.update_in_tx(&mut db, &mut withdraw).await?;
            db.commit().await?;
        }
        Ok(withdraw)
    }
}
