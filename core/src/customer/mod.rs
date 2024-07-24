mod cursor;
mod entity;
pub mod error;
mod repo;

use crate::{
    ledger::*,
    primitives::{CustomerId, KycLevel},
};

pub use cursor::*;
pub use entity::*;
use error::CustomerError;
pub use repo::CustomerRepo;

#[derive(Clone)]
pub struct Customers {
    pool: sqlx::PgPool,
    repo: CustomerRepo,
    ledger: Ledger,
}

impl Customers {
    pub fn new(pool: &sqlx::PgPool, ledger: &Ledger) -> Self {
        let repo = CustomerRepo::new(pool);
        Self {
            pool: pool.clone(),
            repo,
            ledger: ledger.clone(),
        }
    }

    pub fn repo(&self) -> &CustomerRepo {
        &self.repo
    }

    pub async fn create_customers(
        &self,
        id: CustomerId,
        email: String,
    ) -> Result<Customer, CustomerError> {
        let (ledger_account_ids, ledger_account_addresses) =
            self.ledger.create_accounts_for_customer(id).await?;
        let new_customer = NewCustomer::builder()
            .id(id)
            .email(email)
            .account_ids(ledger_account_ids)
            .account_addresses(ledger_account_addresses)
            .build()
            .expect("Could not build customer");

        self.repo.create(new_customer).await
    }

    pub async fn find_by_id(&self, id: CustomerId) -> Result<Option<Customer>, CustomerError> {
        match self.repo.find_by_id(id).await {
            Ok(customer) => Ok(Some(customer)),
            Err(CustomerError::CouldNotFindById(_)) => Ok(None),
            Err(e) => Err(e),
        }
    }

    pub async fn list(
        &self,
        query: crate::query::PaginatedQueryArgs<CustomerByNameCursor>,
    ) -> Result<crate::query::PaginatedQueryRet<Customer, CustomerByNameCursor>, CustomerError>
    {
        self.repo.list(query).await
    }

    pub async fn start_kyc(
        &self,
        customer_id: CustomerId,
        applicant_id: String,
    ) -> Result<Customer, CustomerError> {
        let mut customer = self.repo.find_by_id(customer_id).await?;
        customer.start_kyc(applicant_id);

        let mut db_tx = self.pool.begin().await?;
        self.repo.persist_in_tx(&mut db_tx, &mut customer).await?;
        db_tx.commit().await?;

        Ok(customer)
    }

    pub async fn approve_basic(
        &self,
        customer_id: CustomerId,
        applicant_id: String,
    ) -> Result<Customer, CustomerError> {
        let mut customer = self.repo.find_by_id(customer_id).await?;
        customer.approve_kyc(KycLevel::Basic, applicant_id);

        let mut db_tx = self.pool.begin().await?;
        self.repo.persist_in_tx(&mut db_tx, &mut customer).await?;
        db_tx.commit().await?;

        Ok(customer)
    }

    pub async fn deactivate(
        &self,
        customer_id: CustomerId,
        applicant_id: String,
    ) -> Result<Customer, CustomerError> {
        let mut customer = self.repo.find_by_id(customer_id).await?;
        customer.deactivate(applicant_id);

        let mut db_tx = self.pool.begin().await?;
        self.repo.persist_in_tx(&mut db_tx, &mut customer).await?;
        db_tx.commit().await?;

        Ok(customer)
    }
}
