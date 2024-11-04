es_entity::entity_id! {
    CustomerId,
    WithdrawalId,
    DepositId,
    DocumentId,
    CreditFacilityId,
    DisbursementId,
    InterestAccrualId,
    TermsTemplateId,
    ReportId;

    WithdrawalId => governance::ApprovalProcessId,
    CreditFacilityId => governance::ApprovalProcessId,
    DisbursementId => governance::ApprovalProcessId,
    ReportId => job::JobId,
    CreditFacilityId => job::JobId,
}
