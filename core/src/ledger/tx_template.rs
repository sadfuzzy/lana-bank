use crate::primitives::LedgerTxTemplateId;
use std::{convert::TryFrom, num::TryFromIntError};

use super::cala::graphql::*;

pub struct TxTemplate {
    pub tx_template_id: LedgerTxTemplateId,
    pub version: Result<u32, TryFromIntError>,
}

impl From<tx_template_by_code::TxTemplateByCodeTxTemplateByCode> for TxTemplate {
    fn from(tx_template_by_code: tx_template_by_code::TxTemplateByCodeTxTemplateByCode) -> Self {
        TxTemplate {
            tx_template_id: LedgerTxTemplateId::from(tx_template_by_code.tx_template_id),
            version: u32::try_from(tx_template_by_code.version),
        }
    }
}
