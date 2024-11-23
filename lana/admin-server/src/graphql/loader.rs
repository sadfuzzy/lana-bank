use async_graphql::dataloader::{DataLoader, Loader};

use std::collections::HashMap;

use lana_app::{app::LavaApp, user::error::UserError};

use crate::primitives::*;

use super::{
    approval_process::*, committee::*, credit_facility::*, customer::*, deposit::*, document::*,
    policy::*, terms_template::*, user::*, withdrawal::*,
};

pub type LavaDataLoader = DataLoader<LavaLoader>;
pub struct LavaLoader {
    pub app: LavaApp,
}

impl LavaLoader {
    pub fn new(app: &LavaApp) -> LavaDataLoader {
        DataLoader::new(Self { app: app.clone() }, tokio::task::spawn)
            // Set delay to 0 as per https://github.com/async-graphql/async-graphql/issues/1306
            .delay(std::time::Duration::from_secs(0))
    }
}

impl Loader<UserId> for LavaLoader {
    type Value = User;
    type Error = Arc<UserError>;

    async fn load(&self, keys: &[UserId]) -> Result<HashMap<UserId, User>, Self::Error> {
        self.app.users().find_all(keys).await.map_err(Arc::new)
    }
}

impl Loader<governance::CommitteeId> for LavaLoader {
    type Value = Committee;
    type Error = Arc<governance::error::GovernanceError>;

    async fn load(
        &self,
        keys: &[CommitteeId],
    ) -> Result<HashMap<CommitteeId, Committee>, Self::Error> {
        self.app
            .governance()
            .find_all_committees(keys)
            .await
            .map_err(Arc::new)
    }
}

impl Loader<governance::PolicyId> for LavaLoader {
    type Value = Policy;
    type Error = Arc<governance::error::GovernanceError>;

    async fn load(&self, keys: &[PolicyId]) -> Result<HashMap<PolicyId, Policy>, Self::Error> {
        self.app
            .governance()
            .find_all_policies(keys)
            .await
            .map_err(Arc::new)
    }
}

impl Loader<governance::ApprovalProcessId> for LavaLoader {
    type Value = ApprovalProcess;
    type Error = Arc<governance::error::GovernanceError>;

    async fn load(
        &self,
        keys: &[ApprovalProcessId],
    ) -> Result<HashMap<ApprovalProcessId, ApprovalProcess>, Self::Error> {
        self.app
            .governance()
            .find_all_approval_processes(keys)
            .await
            .map_err(Arc::new)
    }
}

impl Loader<DocumentId> for LavaLoader {
    type Value = Document;
    type Error = Arc<lana_app::document::error::DocumentError>;

    async fn load(
        &self,
        keys: &[DocumentId],
    ) -> Result<HashMap<DocumentId, Document>, Self::Error> {
        self.app.documents().find_all(keys).await.map_err(Arc::new)
    }
}

impl Loader<CustomerId> for LavaLoader {
    type Value = Customer;
    type Error = Arc<lana_app::customer::error::CustomerError>;

    async fn load(
        &self,
        keys: &[CustomerId],
    ) -> Result<HashMap<CustomerId, Customer>, Self::Error> {
        self.app.customers().find_all(keys).await.map_err(Arc::new)
    }
}

impl Loader<WithdrawalId> for LavaLoader {
    type Value = Withdrawal;
    type Error = Arc<lana_app::withdrawal::error::WithdrawalError>;

    async fn load(
        &self,
        keys: &[WithdrawalId],
    ) -> Result<HashMap<WithdrawalId, Withdrawal>, Self::Error> {
        self.app
            .withdrawals()
            .find_all(keys)
            .await
            .map_err(Arc::new)
    }
}

impl Loader<DepositId> for LavaLoader {
    type Value = Deposit;
    type Error = Arc<lana_app::deposit::error::DepositError>;

    async fn load(&self, keys: &[DepositId]) -> Result<HashMap<DepositId, Deposit>, Self::Error> {
        self.app.deposits().find_all(keys).await.map_err(Arc::new)
    }
}

impl Loader<TermsTemplateId> for LavaLoader {
    type Value = TermsTemplate;
    type Error = Arc<lana_app::terms_template::error::TermsTemplateError>;

    async fn load(
        &self,
        keys: &[TermsTemplateId],
    ) -> Result<HashMap<TermsTemplateId, TermsTemplate>, Self::Error> {
        self.app
            .terms_templates()
            .find_all(keys)
            .await
            .map_err(Arc::new)
    }
}

impl Loader<CreditFacilityId> for LavaLoader {
    type Value = CreditFacility;
    type Error = Arc<lana_app::credit_facility::error::CreditFacilityError>;

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

impl Loader<DisbursalId> for LavaLoader {
    type Value = CreditFacilityDisbursal;
    type Error = Arc<lana_app::credit_facility::error::CreditFacilityError>;

    async fn load(
        &self,
        keys: &[DisbursalId],
    ) -> Result<HashMap<DisbursalId, CreditFacilityDisbursal>, Self::Error> {
        self.app
            .credit_facilities()
            .find_all_disbursals(keys)
            .await
            .map_err(Arc::new)
    }
}
