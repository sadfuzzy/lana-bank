es_entity::entity_id! {
    CustomerId,
    WithdrawId,
    DepositId,
    DocumentId,
    LoanId,
    CreditFacilityId,
    DisbursementId,
    InterestAccrualId,
    TermsTemplateId,
    ReportId;

    WithdrawId => governance::ApprovalProcessId,
    CreditFacilityId => governance::ApprovalProcessId,
    DisbursementId => governance::ApprovalProcessId,
    ReportId => job::JobId,
    CreditFacilityId => job::JobId,
    LoanId => job::JobId
}
