use crate::primitives::LedgerTxTemplateId;

use super::cala::graphql::*;

pub struct TxTemplate {
    pub tx_template_id: LedgerTxTemplateId,
    pub code: String,
    pub version: u64,
}

impl From<tx_template_by_code::TxTemplateByCodeTxTemplateByCode> for TxTemplate {
    fn from(tx_template_by_code: tx_template_by_code::TxTemplateByCodeTxTemplateByCode) -> Self {
        TxTemplate {
            tx_template_id: LedgerTxTemplateId::from(tx_template_by_code.tx_template_id),
            code: tx_template_by_code.code,
            version: tx_template_by_code.version as u64,
        }
    }
}
