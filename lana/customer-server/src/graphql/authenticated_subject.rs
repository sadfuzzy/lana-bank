use async_graphql::*;

use core_customer::Customer as DomainCustomer;

use super::customer::*;

#[derive(SimpleObject)]
#[graphql(name = "Subject")]
pub struct AuthenticatedSubject {
    customer: Customer,
}

impl From<DomainCustomer> for AuthenticatedSubject {
    fn from(entity: DomainCustomer) -> Self {
        Self {
            customer: Customer::from(entity),
        }
    }
}
