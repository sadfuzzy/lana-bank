use async_graphql::dataloader::Loader;

use std::{collections::HashMap, sync::Arc};

use super::{audit::AuditEntry, committee::Committee, user::User};
use crate::shared_graphql::customer::Customer;
use lava_app::{
    app::LavaApp,
    audit::{error::AuditError, AuditEntryId, AuditSvc},
    customer::error::CustomerError,
    primitives::{CustomerId, UserId},
    user::error::UserError,
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
