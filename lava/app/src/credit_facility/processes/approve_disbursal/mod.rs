mod job;

use governance::{ApprovalProcess, ApprovalProcessStatus, ApprovalProcessType};

use crate::{
    audit::{Audit, AuditSvc},
    credit_facility::{error::CreditFacilityError, Disbursal, DisbursalRepo},
    governance::Governance,
    primitives::DisbursalId,
};
use rbac_types::{AppObject, CreditFacilityAction};

pub use job::*;

pub const APPROVE_DISBURSAL_PROCESS: ApprovalProcessType = ApprovalProcessType::new("disbursal");

#[derive(Clone)]
pub struct ApproveDisbursal {
    repo: DisbursalRepo,
    audit: Audit,
    governance: Governance,
}

impl ApproveDisbursal {
    pub(in crate::credit_facility) fn new(
        repo: &DisbursalRepo,
        audit: &Audit,
        governance: &Governance,
    ) -> Self {
        Self {
            repo: repo.clone(),
            audit: audit.clone(),
            governance: governance.clone(),
        }
    }

    pub async fn execute_from_svc(
        &self,
        disbursal: &Disbursal,
    ) -> Result<Option<Disbursal>, CreditFacilityError> {
        if disbursal.is_approval_process_concluded() {
            return Ok(None);
        }

        let process: ApprovalProcess = self
            .governance
            .find_all_approval_processes(&[disbursal.approval_process_id])
            .await?
            .remove(&disbursal.approval_process_id)
            .expect("approval process not found");

        let res = match process.status() {
            ApprovalProcessStatus::Approved => Some(self.execute(disbursal.id, true).await?),
            ApprovalProcessStatus::Denied => Some(self.execute(disbursal.id, false).await?),
            _ => None,
        };
        Ok(res)
    }

    #[es_entity::retry_on_concurrent_modification(any_error = true)]
    pub async fn execute(
        &self,
        id: impl es_entity::RetryableInto<DisbursalId>,
        approved: bool,
    ) -> Result<Disbursal, CreditFacilityError> {
        let mut disbursal = self.repo.find_by_id(id.into()).await?;
        if disbursal.is_approval_process_concluded() {
            return Ok(disbursal);
        }
        let mut db = self.repo.pool().begin().await?;
        let audit_info = self
            .audit
            .record_system_entry_in_tx(
                &mut db,
                AppObject::CreditFacility,
                CreditFacilityAction::ConcludeDisbursalApprovalProcess,
            )
            .await?;
        if disbursal
            .approval_process_concluded(approved, audit_info)
            .did_execute()
        {
            self.repo.update_in_tx(&mut db, &mut disbursal).await?;
            db.commit().await?;
        }
        Ok(disbursal)
    }
}
