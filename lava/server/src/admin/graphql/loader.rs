use async_graphql::dataloader::Loader;

use std::{collections::HashMap, sync::Arc};

use super::{
    approval_process::ApprovalProcess, audit::AuditEntry, committee::Committee,
    credit_facility::CreditFacility, policy::Policy, user::User,
};
use crate::shared_graphql::{customer::Customer, withdraw::Withdrawal};
use lava_app::{
    app::LavaApp,
    audit::{error::AuditError, AuditEntryId, AuditSvc},
    credit_facility::error::CreditFacilityError,
    customer::error::CustomerError,
    primitives::*,
    user::error::UserError,
    withdraw::error::WithdrawError,
};

pub struct LavaDataLoader {
    pub app: LavaApp,
}

impl Loader<UserId> for LavaDataLoader {
    type Value = User;
    type Error = Arc<UserError>;

    async fn load(&self, keys: &[UserId]) -> Result<HashMap<UserId, User>, Self::Error> {
        self.app.users().find_all(keys).await.map_err(Arc::new)
    }
}

impl Loader<AuditEntryId> for LavaDataLoader {
    type Value = AuditEntry;
    type Error = Arc<AuditError>;

    async fn load(
        &self,
        keys: &[AuditEntryId],
    ) -> Result<HashMap<AuditEntryId, AuditEntry>, Self::Error> {
        self.app.audit().find_all(keys).await.map_err(Arc::new)
    }
}

impl Loader<CustomerId> for LavaDataLoader {
    type Value = Customer;
    type Error = Arc<CustomerError>;

    async fn load(
        &self,
        keys: &[CustomerId],
    ) -> Result<HashMap<CustomerId, Customer>, Self::Error> {
        self.app.customers().find_all(keys).await.map_err(Arc::new)
    }
}

impl Loader<WithdrawId> for LavaDataLoader {
    type Value = Withdrawal;
    type Error = Arc<WithdrawError>;

    async fn load(
        &self,
        keys: &[WithdrawId],
    ) -> Result<HashMap<WithdrawId, Withdrawal>, Self::Error> {
        self.app.withdraws().find_all(keys).await.map_err(Arc::new)
    }
}

impl Loader<CreditFacilityId> for LavaDataLoader {
    type Value = CreditFacility;
    type Error = Arc<CreditFacilityError>;

    async fn load(
        &self,
        keys: &[CreditFacilityId],
    ) -> Result<HashMap<CreditFacilityId, CreditFacility>, Self::Error> {
        self.app
            .credit_facilities()
            .find_all(keys)
            .await
            .map_err(Arc::new)
    }
}

impl Loader<governance::CommitteeId> for LavaDataLoader {
    type Value = Committee;
    type Error = Arc<governance::committee_error::CommitteeError>;

    async fn load(
        &self,
        keys: &[governance::CommitteeId],
    ) -> Result<HashMap<governance::CommitteeId, Committee>, Self::Error> {
        self.app
            .governance()
            .find_all_committees(keys)
            .await
            .map_err(Arc::new)
    }
}

impl Loader<governance::ApprovalProcessId> for LavaDataLoader {
    type Value = ApprovalProcess;
    type Error = Arc<governance::approval_process_error::ApprovalProcessError>;

    async fn load(
        &self,
        keys: &[governance::ApprovalProcessId],
    ) -> Result<HashMap<governance::ApprovalProcessId, ApprovalProcess>, Self::Error> {
        self.app
            .governance()
            .find_all_approval_processes(keys)
            .await
            .map_err(Arc::new)
    }
}

impl Loader<governance::PolicyId> for LavaDataLoader {
    type Value = Policy;
    type Error = Arc<governance::policy_error::PolicyError>;

    async fn load(
        &self,
        keys: &[governance::PolicyId],
    ) -> Result<HashMap<governance::PolicyId, Policy>, Self::Error> {
        self.app
            .governance()
            .find_all_policies(keys)
            .await
            .map_err(Arc::new)
    }
}
