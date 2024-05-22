use crate::primitives::LedgerTxTemplateId;
use std::{convert::TryFrom, num::TryFromIntError};

use super::super::cala::graphql::*;

pub struct DepositTxTemplate {
    pub tx_template_id: LedgerTxTemplateId,
    pub version: Result<u32, TryFromIntError>,
}

impl From<topup_user_unallocated_collateral_template_create::TopupUserUnallocatedCollateralTemplateCreateTxTemplateCreate>
    for DepositTxTemplate
{
    fn from(
        tx_template_create: topup_user_unallocated_collateral_template_create::TopupUserUnallocatedCollateralTemplateCreateTxTemplateCreate,
    ) -> Self {
        DepositTxTemplate {
            tx_template_id: LedgerTxTemplateId::from(tx_template_create.tx_template.tx_template_id),
            version: u32::try_from(tx_template_create.tx_template.version),
        }
    }
}
