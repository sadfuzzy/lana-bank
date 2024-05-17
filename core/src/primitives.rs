crate::entity_id! { JobId }
crate::entity_id! { LedgerAccountId }
crate::entity_id! { FixedTermLoanId }

impl From<FixedTermLoanId> for LedgerAccountId {
    fn from(id: FixedTermLoanId) -> Self {
        LedgerAccountId::from(id.0)
    }
}
