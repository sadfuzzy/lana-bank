use cala_ledger::primitives::TransactionId as LedgerTransactionId;

es_entity::entity_id! {
    CustomerId,
    DocumentId,
    CreditFacilityId,
    DisbursalId,
    InterestAccrualId,
    TermsTemplateId,
    ReportId;

    CreditFacilityId => governance::ApprovalProcessId,
    DisbursalId => governance::ApprovalProcessId,
    DisbursalId => LedgerTransactionId,

    ReportId => job::JobId,
    CreditFacilityId => job::JobId,
    InterestAccrualId => job::JobId,
    CustomerId => deposit::DepositAccountHolderId,
}
