use async_graphql::*;
use std::sync::Arc;

use core_customer::{AccountStatus, Customer as DomainCustomer, KycLevel};

use crate::primitives::*;

use super::deposit_account::*;

use thiserror::Error;

#[derive(Error, Debug)]
pub enum CustomerError {
    #[error("CustomerError - DepositAccountNotFound")]
    DepositAccountNotFound,
}

#[derive(SimpleObject, Clone)]
#[graphql(complex)]
pub struct Customer {
    id: ID,
    customer_id: UUID,
    status: AccountStatus,
    level: KycLevel,
    created_at: Timestamp,

    #[graphql(skip)]
    pub(super) entity: Arc<DomainCustomer>,
}

impl From<DomainCustomer> for Customer {
    fn from(customer: DomainCustomer) -> Self {
        Customer {
            id: customer.id.to_global_id(),
            customer_id: UUID::from(customer.id),
            status: customer.status,
            level: customer.level,
            created_at: customer.created_at().into(),
            entity: Arc::new(customer),
        }
    }
}

#[ComplexObject]
impl Customer {
    async fn email(&self) -> &str {
        &self.entity.email
    }

    async fn telegram_id(&self) -> &str {
        &self.entity.telegram_id
    }

    async fn deposit_account(&self, ctx: &Context<'_>) -> async_graphql::Result<DepositAccount> {
        let (app, sub) = crate::app_and_sub_from_ctx!(ctx);

        Ok(app
            .deposits()
            .for_subject(sub)?
            .list_accounts_by_created_at(Default::default(), ListDirection::Descending)
            .await?
            .entities
            .into_iter()
            .map(DepositAccount::from)
            .next()
            .ok_or(CustomerError::DepositAccountNotFound)?)
    }
}
