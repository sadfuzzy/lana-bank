use derive_builder::Builder;
use serde::{Deserialize, Serialize};

use std::collections::HashMap;

use audit::AuditInfo;

use es_entity::*;

use super::primitives::*;

#[derive(EsEvent, Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "snake_case")]
#[es_event(id = "ChartId")]
pub enum ChartEvent {
    Initialized {
        id: ChartId,
        name: String,
        reference: String,
        audit_info: AuditInfo,
    },
    ControlAccountAdded {
        spec: AccountSpec,
        ledger_account_set_id: LedgerAccountSetId,
        audit_info: AuditInfo,
    },
    ControlSubAccountAdded {
        spec: AccountSpec,
        ledger_account_set_id: LedgerAccountSetId,
        audit_info: AuditInfo,
    },
}

#[derive(EsEntity, Builder)]
#[builder(pattern = "owned", build_fn(error = "EsEntityError"))]
pub struct Chart {
    pub id: ChartId,
    pub reference: String,
    pub name: String,
    all_accounts: HashMap<AccountCode, (AccountSpec, LedgerAccountSetId)>,
    pub(super) events: EntityEvents<ChartEvent>,
}

impl Chart {
    pub fn create_control_account(
        &mut self,
        spec: &AccountSpec,
        audit_info: AuditInfo,
    ) -> Idempotent<LedgerAccountSetId> {
        if self.all_accounts.contains_key(&spec.code) {
            return Idempotent::AlreadyApplied;
        }
        let ledger_account_set_id = LedgerAccountSetId::new();
        self.events.push(ChartEvent::ControlAccountAdded {
            spec: spec.clone(),
            ledger_account_set_id,
            audit_info,
        });
        Idempotent::Executed(ledger_account_set_id)
    }

    pub fn create_control_sub_account(
        &mut self,
        spec: &AccountSpec,
        audit_info: AuditInfo,
    ) -> Idempotent<(Option<LedgerAccountSetId>, LedgerAccountSetId)> {
        if self.all_accounts.contains_key(&spec.code) {
            return Idempotent::AlreadyApplied;
        }
        let ledger_account_set_id = LedgerAccountSetId::new();
        self.events.push(ChartEvent::ControlSubAccountAdded {
            spec: spec.clone(),
            ledger_account_set_id,
            audit_info,
        });
        let parent = if let Some(parent) = spec.parent.as_ref() {
            self.all_accounts.get(parent).map(|(_, id)| *id)
        } else {
            None
        };
        Idempotent::Executed((parent, ledger_account_set_id))
    }
}

impl TryFromEvents<ChartEvent> for Chart {
    fn try_from_events(events: EntityEvents<ChartEvent>) -> Result<Self, EsEntityError> {
        let mut builder = ChartBuilder::default();
        let mut all_accounts = HashMap::new();
        for event in events.iter_all() {
            match event {
                ChartEvent::Initialized {
                    id,
                    reference,
                    name,
                    ..
                } => {
                    builder = builder
                        .id(*id)
                        .reference(reference.to_string())
                        .name(name.to_string())
                }
                ChartEvent::ControlAccountAdded {
                    spec,
                    ledger_account_set_id,
                    ..
                } => {
                    all_accounts.insert(spec.code.clone(), (spec.clone(), *ledger_account_set_id));
                }
                ChartEvent::ControlSubAccountAdded {
                    spec,
                    ledger_account_set_id,
                    ..
                } => {
                    all_accounts.insert(spec.code.clone(), (spec.clone(), *ledger_account_set_id));
                }
            }
        }
        builder.all_accounts(all_accounts).events(events).build()
    }
}

#[derive(Debug, Builder)]
pub struct NewChart {
    #[builder(setter(into))]
    pub(super) id: ChartId,
    pub(super) name: String,
    pub(super) reference: String,
    #[builder(setter(into))]
    pub audit_info: AuditInfo,
}

impl NewChart {
    pub fn builder() -> NewChartBuilder {
        NewChartBuilder::default()
    }
}

impl IntoEvents<ChartEvent> for NewChart {
    fn into_events(self) -> EntityEvents<ChartEvent> {
        EntityEvents::init(
            self.id,
            [ChartEvent::Initialized {
                id: self.id,
                name: self.name,
                reference: self.reference,
                audit_info: self.audit_info,
            }],
        )
    }
}
