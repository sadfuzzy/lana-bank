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

    pub async fn balance(
        &self,
        id: impl Into<CreditFacilityId> + std::fmt::Debug,
    ) -> Result<CreditFacilityBalance, CreditFacilityError> {
        let credit_facility = self.credit_facilities.find_by_id(id.into()).await?;

        self.ensure_credit_facility_access(
            &credit_facility,
            Object::CreditFacility,
            CreditFacilityAction::Read,
        )
        .await?;

        Ok(credit_facility.balances())
    }

    async fn ensure_credit_facility_access(
        &self,
        credit_facility: &CreditFacility,
        object: Object,
        action: CreditFacilityAction,
    ) -> Result<(), CreditFacilityError> {
        if credit_facility.customer_id != self.customer_id {
            self.authz
                .audit()
                .record_entry(self.subject, object, action, false)
                .await?;
            return Err(CreditFacilityError::CustomerMismatchForCreditFacility);
        }

        self.authz
            .audit()
            .record_entry(self.subject, object, action, true)
            .await?;
        Ok(())
    }
}
