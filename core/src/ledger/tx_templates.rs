use crate::primitives::LedgerTxTemplateId;

use super::cala::graphql::*;

pub struct DepositTxTemplate {
    pub tx_template_id: LedgerTxTemplateId,
}

impl From<lava_standard_tx_templates_create::LavaStandardTxTemplatesCreateDepositTemplate>
    for DepositTxTemplate
{
    fn from(
        data: lava_standard_tx_templates_create::LavaStandardTxTemplatesCreateDepositTemplate,
    ) -> Self {
        DepositTxTemplate {
            tx_template_id: LedgerTxTemplateId::from(data.tx_template.tx_template_id),
        }
    }
}

pub struct WithdrawalTxTemplate {
    pub tx_template_id: LedgerTxTemplateId,
}

impl From<lava_standard_tx_templates_create::LavaStandardTxTemplatesCreateWithdrawalTemplate>
    for WithdrawalTxTemplate
{
    fn from(
        data: lava_standard_tx_templates_create::LavaStandardTxTemplatesCreateWithdrawalTemplate,
    ) -> Self {
        WithdrawalTxTemplate {
            tx_template_id: LedgerTxTemplateId::from(data.tx_template.tx_template_id),
        }
    }
}
