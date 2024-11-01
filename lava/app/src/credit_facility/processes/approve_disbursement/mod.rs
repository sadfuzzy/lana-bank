mod job;

use governance::{ApprovalProcess, ApprovalProcessStatus, ApprovalProcessType};

use crate::{
    audit::{Audit, AuditSvc},
    credit_facility::{error::CreditFacilityError, Disbursement, DisbursementRepo},
    governance::Governance,
    primitives::DisbursementId,
};
use rbac_types::{AppObject, CreditFacilityAction};

pub use job::*;

pub const APPROVE_DISBURSEMENT_PROCESS: ApprovalProcessType = ApprovalProcessType::new("disbursal");

#[derive(Clone)]
pub struct ApproveDisbursement {
    repo: DisbursementRepo,
    audit: Audit,
    governance: Governance,
}

impl ApproveDisbursement {
    pub(in crate::credit_facility) fn new(
        repo: &DisbursementRepo,
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
        disbursement: &Disbursement,
    ) -> Result<Option<Disbursement>, CreditFacilityError> {
        if disbursement.is_approval_process_concluded() {
            return Ok(None);
        }

        let process: ApprovalProcess = self
            .governance
            .find_all_approval_processes(&[disbursement.approval_process_id])
            .await?
            .remove(&disbursement.approval_process_id)
            .expect("approval process not found");

        let res = match process.status() {
            ApprovalProcessStatus::Approved => Some(self.execute(disbursement.id, true).await?),
            ApprovalProcessStatus::Denied => Some(self.execute(disbursement.id, false).await?),
            _ => None,
        };
        Ok(res)
    }

    #[es_entity::retry_on_concurrent_modification]
    pub async fn execute(
        &self,
        id: impl es_entity::RetryableInto<DisbursementId>,
        approved: bool,
    ) -> Result<Disbursement, CreditFacilityError> {
        let mut disbursement = self.repo.find_by_id(id.into()).await?;
        if disbursement.is_approval_process_concluded() {
            return Ok(disbursement);
        }
        let mut db = self.repo.pool().begin().await?;
        let audit_info = self
            .audit
            .record_system_entry_in_tx(
                &mut db,
                AppObject::CreditFacility,
                CreditFacilityAction::ConcludeDisbursementApprovalProcess,
            )
            .await?;
        disbursement.approval_process_concluded(approved, audit_info)?;
        if self.repo.update_in_tx(&mut db, &mut disbursement).await? {
            db.commit().await?;
        }
        Ok(disbursement)
    }
}
