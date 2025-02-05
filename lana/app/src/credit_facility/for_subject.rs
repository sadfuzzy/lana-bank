use audit::AuditSvc;
use es_entity::{PaginatedQueryArgs, PaginatedQueryRet};

use super::*;

pub struct CreditFacilitiesForSubject<'a> {
    customer_id: CustomerId,
    subject: &'a Subject,
    authz: &'a Authorization,
    credit_facilities: &'a CreditFacilityRepo,
}

impl<'a> CreditFacilitiesForSubject<'a> {
    pub(super) fn new(
        subject: &'a Subject,
        customer_id: CustomerId,
        authz: &'a Authorization,
        credit_facilities: &'a CreditFacilityRepo,
    ) -> Self {
        Self {
            customer_id,
            subject,
            authz,
            credit_facilities,
        }
    }

    pub async fn list_credit_facilities_by_created_at(
        &self,
        query: PaginatedQueryArgs<CreditFacilitiesByCreatedAtCursor>,
        direction: ListDirection,
    ) -> Result<
        PaginatedQueryRet<CreditFacility, CreditFacilitiesByCreatedAtCursor>,
        CreditFacilityError,
    > {
        self.authz
            .audit()
            .record_entry(
                self.subject,
                Object::CreditFacility,
                CreditFacilityAction::List,
                true,
            )
            .await?;

        self.credit_facilities
            .list_for_customer_id_by_created_at(self.customer_id, query, direction)
            .await
    }
}
