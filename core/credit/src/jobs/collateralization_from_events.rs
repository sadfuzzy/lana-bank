use futures::StreamExt;
use serde::{Deserialize, Serialize};

use authz::PermissionCheck;

use audit::AuditSvc;
use core_price::Price;
use job::*;
use outbox::{EventSequence, Outbox, OutboxEventMarker};

use crate::{
    credit_facility::CreditFacilityRepo, error::CoreCreditError, event::CoreCreditEvent,
    ledger::CreditLedger, primitives::*,
};

#[derive(Serialize, Deserialize)]
pub struct CreditFacilityCollateralizationFromEventsJobConfig<Perms, E> {
    pub upgrade_buffer_cvl_pct: CVLPct,
    pub _phantom: std::marker::PhantomData<(Perms, E)>,
}
impl<Perms, E> JobConfig for CreditFacilityCollateralizationFromEventsJobConfig<Perms, E>
where
    Perms: PermissionCheck,
    <<Perms as PermissionCheck>::Audit as AuditSvc>::Action: From<CoreCreditAction>,
    <<Perms as PermissionCheck>::Audit as AuditSvc>::Object: From<CoreCreditObject>,
    E: OutboxEventMarker<CoreCreditEvent>,
{
    type Initializer = CreditFacilityCollateralizationFromEventsInitializer<Perms, E>;
}

pub struct CreditFacilityCollateralizationFromEventsInitializer<Perms, E>
where
    Perms: PermissionCheck,
    <<Perms as PermissionCheck>::Audit as AuditSvc>::Action: From<CoreCreditAction>,
    <<Perms as PermissionCheck>::Audit as AuditSvc>::Object: From<CoreCreditObject>,
    E: OutboxEventMarker<CoreCreditEvent>,
{
    outbox: Outbox<E>,
    repo: CreditFacilityRepo<E>,
    ledger: CreditLedger,
    price: Price,
    audit: Perms::Audit,
}

impl<Perms, E> CreditFacilityCollateralizationFromEventsInitializer<Perms, E>
where
    Perms: PermissionCheck,
    <<Perms as PermissionCheck>::Audit as AuditSvc>::Action: From<CoreCreditAction>,
    <<Perms as PermissionCheck>::Audit as AuditSvc>::Object: From<CoreCreditObject>,
    E: OutboxEventMarker<CoreCreditEvent>,
{
    pub fn new(
        outbox: &Outbox<E>,
        repo: &CreditFacilityRepo<E>,
        ledger: &CreditLedger,
        price: &Price,
        audit: &Perms::Audit,
    ) -> Self {
        Self {
            outbox: outbox.clone(),
            repo: repo.clone(),
            ledger: ledger.clone(),
            price: price.clone(),
            audit: audit.clone(),
        }
    }
}

const CREDIT_FACILITY_COLLATERALIZATION_FROM_EVENTS_JOB: JobType =
    JobType::new("credit-facility-collateralization-from-events");
impl<Perms, E> JobInitializer for CreditFacilityCollateralizationFromEventsInitializer<Perms, E>
where
    Perms: PermissionCheck,
    <<Perms as PermissionCheck>::Audit as AuditSvc>::Action: From<CoreCreditAction>,
    <<Perms as PermissionCheck>::Audit as AuditSvc>::Object: From<CoreCreditObject>,
    E: OutboxEventMarker<CoreCreditEvent>,
{
    fn job_type() -> JobType
    where
        Self: Sized,
    {
        CREDIT_FACILITY_COLLATERALIZATION_FROM_EVENTS_JOB
    }

    fn init(&self, job: &Job) -> Result<Box<dyn JobRunner>, Box<dyn std::error::Error>> {
        Ok(Box::new(CreditFacilityCollateralizationFromEventsRunner::<
            Perms,
            E,
        > {
            config: job.config()?,
            outbox: self.outbox.clone(),
            repo: self.repo.clone(),
            ledger: self.ledger.clone(),
            price: self.price.clone(),
            audit: self.audit.clone(),
        }))
    }
}

// TODO: reproduce 'collateralization_ratio' test from old credit facility

#[derive(Default, Clone, Copy, serde::Deserialize, serde::Serialize)]
struct CreditFacilityCollateralizationFromEventsData {
    sequence: EventSequence,
}

pub struct CreditFacilityCollateralizationFromEventsRunner<Perms, E>
where
    Perms: PermissionCheck,
    E: OutboxEventMarker<CoreCreditEvent>,
{
    config: CreditFacilityCollateralizationFromEventsJobConfig<Perms, E>,
    outbox: Outbox<E>,
    repo: CreditFacilityRepo<E>,
    ledger: CreditLedger,
    price: Price,
    audit: Perms::Audit,
}

impl<Perms, E> CreditFacilityCollateralizationFromEventsRunner<Perms, E>
where
    Perms: PermissionCheck,
    <<Perms as PermissionCheck>::Audit as AuditSvc>::Action: From<CoreCreditAction>,
    <<Perms as PermissionCheck>::Audit as AuditSvc>::Object: From<CoreCreditObject>,
    E: OutboxEventMarker<CoreCreditEvent>,
{
    #[es_entity::retry_on_concurrent_modification(any_error = true)]
    async fn execute(&self, id: CreditFacilityId) -> Result<(), CoreCreditError> {
        let mut credit_facility = self.repo.find_by_id(id).await?;

        let mut db = self.repo.begin_op().await?;

        let audit_info = self
            .audit
            .record_system_entry_in_tx(
                db.tx(),
                CoreCreditObject::all_credit_facilities(),
                CoreCreditAction::CREDIT_FACILITY_UPDATE_COLLATERALIZATION_STATE,
            )
            .await?;

        let balances = self
            .ledger
            .get_credit_facility_balance(credit_facility.account_ids)
            .await?;

        let price = self.price.usd_cents_per_btc().await?;
        if credit_facility
            .update_collateralization(
                price,
                self.config.upgrade_buffer_cvl_pct,
                balances,
                &audit_info,
            )
            .did_execute()
        {
            self.repo
                .update_in_op(&mut db, &mut credit_facility)
                .await?;

            db.commit().await?;
        }

        Ok(())
    }
}

#[async_trait::async_trait]
impl<Perms, E> JobRunner for CreditFacilityCollateralizationFromEventsRunner<Perms, E>
where
    Perms: PermissionCheck,
    <<Perms as PermissionCheck>::Audit as AuditSvc>::Action: From<CoreCreditAction>,
    <<Perms as PermissionCheck>::Audit as AuditSvc>::Object: From<CoreCreditObject>,
    E: OutboxEventMarker<CoreCreditEvent>,
{
    async fn run(
        &self,
        mut current_job: CurrentJob,
    ) -> Result<JobCompletion, Box<dyn std::error::Error>> {
        let mut state = current_job
            .execution_state::<CreditFacilityCollateralizationFromEventsData>()?
            .unwrap_or_default();
        let mut stream = self.outbox.listen_persisted(Some(state.sequence)).await?;

        while let Some(message) = stream.next().await {
            match message.as_ref().as_event() {
                Some(CoreCreditEvent::FacilityCollateralUpdated {
                    credit_facility_id: id,
                    ..
                })
                | Some(CoreCreditEvent::ObligationCreated {
                    credit_facility_id: id,
                    ..
                })
                | Some(CoreCreditEvent::FacilityRepaymentRecorded {
                    credit_facility_id: id,
                    ..
                }) => {
                    self.execute(*id).await?;
                    state.sequence = message.sequence;
                    current_job.update_execution_state(state).await?;
                }
                _ => (),
            }
        }

        Ok(JobCompletion::RescheduleNow)
    }
}
