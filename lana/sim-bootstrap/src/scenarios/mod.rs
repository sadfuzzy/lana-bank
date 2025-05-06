use futures::StreamExt;
use lana_app::{app::LanaApp, primitives::*};
use lana_events::{CoreCreditEvent, LanaEvent};
use rust_decimal_macros::dec;
use tokio::task::JoinHandle;

use super::helpers;

pub async fn run(
    sub: &Subject,
    app: &LanaApp,
) -> anyhow::Result<Vec<JoinHandle<Result<(), anyhow::Error>>>> {
    let mut handles = Vec::new();
    let sub = *sub;

    {
        let app = app.clone();
        handles.push(tokio::spawn(async move {
            timely_payments_scenario(sub, &app).await
        }));
    }
    {
        let app = app.clone();
        handles.push(tokio::spawn(async move {
            first_payment_45d_late_scenario(sub, &app).await
        }));
    }
    {
        let app = app.clone();
        handles.push(tokio::spawn(async move {
            first_payment_100d_late_scenario(sub, &app).await
        }));
    }
    {
        let app = app.clone();
        handles.push(tokio::spawn(async move {
            principal_45d_late_scenario(sub, &app).await
        }));
    }
    {
        let app = app.clone();
        handles.push(tokio::spawn(async move {
            principal_90d_late_scenario(sub, &app).await
        }));
    }

    Ok(handles)
}

// Scenario 1: A credit facility that made timely payments and was paid off all according to the initial payment plan
async fn timely_payments_scenario(sub: Subject, app: &LanaApp) -> anyhow::Result<()> {
    let (customer_id, deposit_account_id) =
        helpers::create_customer(&sub, app, "1-timely-paid").await?;

    let deposit_amount = UsdCents::try_from_usd(dec!(10_000_000))?;
    helpers::make_deposit(&sub, app, &customer_id, deposit_amount).await?;

    let cf_terms = helpers::std_terms();
    let cf_amount = UsdCents::try_from_usd(dec!(10_000_000))?;
    let cf = app
        .credit()
        .initiate(&sub, customer_id, deposit_account_id, cf_amount, cf_terms)
        .await?;

    let mut stream = app.outbox().listen_persisted(None).await?;
    while let Some(msg) = stream.next().await {
        match &msg.payload {
            Some(LanaEvent::Credit(CoreCreditEvent::FacilityApproved { id })) if cf.id == *id => {
                app.credit()
                    .update_collateral(&sub, cf.id, Satoshis::try_from_btc(dec!(230))?)
                    .await?;
            }
            Some(LanaEvent::Credit(CoreCreditEvent::FacilityActivated { id, .. }))
                if cf.id == *id =>
            {
                app.credit()
                    .initiate_disbursal(&sub, cf.id, UsdCents::try_from_usd(dec!(1_000_000))?)
                    .await?;
            }
            Some(LanaEvent::Credit(CoreCreditEvent::ObligationDue {
                credit_facility_id: id,
                amount,
                ..
            })) if { cf.id == *id && amount > &UsdCents::ZERO } => {
                app.credit().record_payment(&sub, *id, *amount).await?;
                let facility = app
                    .credit()
                    .find_by_id(&sub, *id)
                    .await?
                    .expect("cf exists");
                if facility.interest_accrual_cycle_in_progress().is_none() {
                    let total_outstanding_amount = app.credit().outstanding(&facility).await?;
                    app.credit()
                        .record_payment(&sub, facility.id, total_outstanding_amount)
                        .await?;
                    app.credit().complete_facility(&sub, facility.id).await?;
                }
            }
            Some(LanaEvent::Credit(CoreCreditEvent::FacilityCompleted { id, .. })) => {
                if cf.id == *id {
                    break;
                }
            }
            _ => {}
        }
    }

    Ok(())
}

// Scenario 2: Credit facility with one interest payment 45d late
async fn first_payment_45d_late_scenario(sub: Subject, app: &LanaApp) -> anyhow::Result<()> {
    let (customer_id, deposit_account_id) =
        helpers::create_customer(&sub, app, "2-first-payment-45d-late").await?;

    let deposit_amount = UsdCents::try_from_usd(dec!(10_000_000))?;
    helpers::make_deposit(&sub, app, &customer_id, deposit_amount).await?;

    let cf_terms = helpers::std_terms();
    let cf_amount = UsdCents::try_from_usd(dec!(10_000_000))?;
    let cf = app
        .credit()
        .initiate(&sub, customer_id, deposit_account_id, cf_amount, cf_terms)
        .await?;

    let mut late_payment_done = false;

    let mut stream = app.outbox().listen_persisted(None).await?;
    while let Some(msg) = stream.next().await {
        match &msg.payload {
            Some(LanaEvent::Credit(CoreCreditEvent::FacilityApproved { id })) if cf.id == *id => {
                app.credit()
                    .update_collateral(&sub, cf.id, Satoshis::try_from_btc(dec!(230))?)
                    .await?;
            }
            Some(LanaEvent::Credit(CoreCreditEvent::FacilityActivated { id, .. }))
                if cf.id == *id =>
            {
                app.credit()
                    .initiate_disbursal(&sub, cf.id, UsdCents::try_from_usd(dec!(1_000_000))?)
                    .await?;
            }
            Some(LanaEvent::Credit(CoreCreditEvent::ObligationDue {
                credit_facility_id: id,
                amount,
                ..
            })) if { cf.id == *id && amount > &UsdCents::ZERO && !late_payment_done } => {
                let late_app = app.clone();
                let late_id = *id;
                let late_amount = *amount;
                tokio::spawn(async move {
                    sim_time::sleep(std::time::Duration::from_secs(60 * 60 * 24 * 45)).await;
                    late_app
                        .credit()
                        .record_payment(&sub, late_id, late_amount)
                        .await
                        .expect("Failed to record payment");
                });
                late_payment_done = true;
            }
            Some(LanaEvent::Credit(CoreCreditEvent::ObligationDue {
                credit_facility_id: id,
                amount,
                ..
            })) if { cf.id == *id && amount > &UsdCents::ZERO && late_payment_done } => {
                app.credit().record_payment(&sub, *id, *amount).await?;
                let facility = app
                    .credit()
                    .find_by_id(&sub, *id)
                    .await?
                    .expect("cf exists");
                if facility.interest_accrual_cycle_in_progress().is_none() {
                    let total_outstanding_amount = app.credit().outstanding(&facility).await?;
                    app.credit()
                        .record_payment(&sub, facility.id, total_outstanding_amount)
                        .await?;
                    app.credit().complete_facility(&sub, facility.id).await?;
                }
            }
            Some(LanaEvent::Credit(CoreCreditEvent::FacilityCompleted { id, .. })) => {
                if cf.id == *id {
                    break;
                }
            }
            _ => {}
        }
    }

    Ok(())
}

// Scenario 3: Credit facility with one interest payment 100d late
async fn first_payment_100d_late_scenario(sub: Subject, app: &LanaApp) -> anyhow::Result<()> {
    let (customer_id, deposit_account_id) =
        helpers::create_customer(&sub, app, "3-first-payment-100d-late").await?;

    let deposit_amount = UsdCents::try_from_usd(dec!(10_000_000))?;
    helpers::make_deposit(&sub, app, &customer_id, deposit_amount).await?;

    let cf_terms = helpers::std_terms();
    let cf_amount = UsdCents::try_from_usd(dec!(10_000_000))?;
    let cf = app
        .credit()
        .initiate(&sub, customer_id, deposit_account_id, cf_amount, cf_terms)
        .await?;

    let mut late_payment_done = false;

    let mut stream = app.outbox().listen_persisted(None).await?;
    while let Some(msg) = stream.next().await {
        match &msg.payload {
            Some(LanaEvent::Credit(CoreCreditEvent::FacilityApproved { id })) if cf.id == *id => {
                app.credit()
                    .update_collateral(&sub, cf.id, Satoshis::try_from_btc(dec!(230))?)
                    .await?;
            }
            Some(LanaEvent::Credit(CoreCreditEvent::FacilityActivated { id, .. }))
                if cf.id == *id =>
            {
                app.credit()
                    .initiate_disbursal(&sub, cf.id, UsdCents::try_from_usd(dec!(1_000_000))?)
                    .await?;
            }
            Some(LanaEvent::Credit(CoreCreditEvent::ObligationDue {
                credit_facility_id: id,
                amount,
                ..
            })) if { cf.id == *id && amount > &UsdCents::ZERO && !late_payment_done } => {
                let late_app = app.clone();
                let late_id = *id;
                let late_amount = *amount;
                tokio::spawn(async move {
                    sim_time::sleep(std::time::Duration::from_secs(60 * 60 * 24 * 100)).await;
                    late_app
                        .credit()
                        .record_payment(&sub, late_id, late_amount)
                        .await
                        .expect("Failed to record payment");
                });
                late_payment_done = true;
            }
            Some(LanaEvent::Credit(CoreCreditEvent::ObligationDue {
                credit_facility_id: id,
                amount,
                ..
            })) if { cf.id == *id && amount > &UsdCents::ZERO && late_payment_done } => {
                app.credit().record_payment(&sub, *id, *amount).await?;
                let facility = app
                    .credit()
                    .find_by_id(&sub, *id)
                    .await?
                    .expect("cf exists");
                if facility.interest_accrual_cycle_in_progress().is_none() {
                    let total_outstanding_amount = app.credit().outstanding(&facility).await?;
                    app.credit()
                        .record_payment(&sub, facility.id, total_outstanding_amount)
                        .await?;
                    app.credit().complete_facility(&sub, facility.id).await?;
                }
            }
            Some(LanaEvent::Credit(CoreCreditEvent::FacilityCompleted { id, .. })) => {
                if cf.id == *id {
                    break;
                }
            }
            _ => {}
        }
    }

    Ok(())
}

// Scenario 4: Principal payment 45d late
async fn principal_45d_late_scenario(sub: Subject, app: &LanaApp) -> anyhow::Result<()> {
    let (customer_id, deposit_account_id) =
        helpers::create_customer(&sub, app, "4-principal-45d-late").await?;

    let deposit_amount = UsdCents::try_from_usd(dec!(10_000_000))?;
    helpers::make_deposit(&sub, app, &customer_id, deposit_amount).await?;

    let cf_terms = helpers::std_terms();
    let cf_amount = UsdCents::try_from_usd(dec!(10_000_000))?;
    let cf = app
        .credit()
        .initiate(&sub, customer_id, deposit_account_id, cf_amount, cf_terms)
        .await?;

    let disbursal_principal = UsdCents::try_from_usd(dec!(1_000_000))?;

    let mut stream = app.outbox().listen_persisted(None).await?;
    while let Some(msg) = stream.next().await {
        match &msg.payload {
            Some(LanaEvent::Credit(CoreCreditEvent::FacilityApproved { id })) if cf.id == *id => {
                app.credit()
                    .update_collateral(&sub, cf.id, Satoshis::try_from_btc(dec!(230))?)
                    .await?;
            }
            Some(LanaEvent::Credit(CoreCreditEvent::FacilityActivated { id, .. }))
                if cf.id == *id =>
            {
                app.credit()
                    .initiate_disbursal(&sub, cf.id, disbursal_principal)
                    .await?;
            }
            Some(LanaEvent::Credit(CoreCreditEvent::ObligationDue {
                credit_facility_id: id,
                amount,
                ..
            })) if {
                cf.id == *id && amount > &UsdCents::ZERO && *amount == disbursal_principal
            } =>
            {
                let late_app = app.clone();
                let late_id = *id;
                let late_amount = *amount;
                tokio::spawn(async move {
                    sim_time::sleep(std::time::Duration::from_secs(60 * 60 * 24 * 45)).await;
                    late_app
                        .credit()
                        .record_payment(&sub, late_id, late_amount)
                        .await
                        .expect("Failed to record payment");
                });
            }
            Some(LanaEvent::Credit(CoreCreditEvent::ObligationDue {
                credit_facility_id: id,
                amount,
                ..
            })) if {
                cf.id == *id && amount > &UsdCents::ZERO && *amount != disbursal_principal
            } =>
            {
                app.credit().record_payment(&sub, *id, *amount).await?;
                let facility = app
                    .credit()
                    .find_by_id(&sub, *id)
                    .await?
                    .expect("cf exists");
                if facility.interest_accrual_cycle_in_progress().is_none() {
                    let total_outstanding_amount = app.credit().outstanding(&facility).await?;
                    app.credit()
                        .record_payment(&sub, facility.id, total_outstanding_amount)
                        .await?;
                    app.credit().complete_facility(&sub, facility.id).await?;
                }
            }
            Some(LanaEvent::Credit(CoreCreditEvent::FacilityCompleted { id, .. })) => {
                if cf.id == *id {
                    break;
                }
            }
            _ => {}
        }
    }

    Ok(())
}

// Scenario 5: Principal payment 90d late
async fn principal_90d_late_scenario(sub: Subject, app: &LanaApp) -> anyhow::Result<()> {
    let (customer_id, deposit_account_id) =
        helpers::create_customer(&sub, app, "5-principal-90d-late").await?;

    let deposit_amount = UsdCents::try_from_usd(dec!(10_000_000))?;
    helpers::make_deposit(&sub, app, &customer_id, deposit_amount).await?;

    let cf_terms = helpers::std_terms();
    let cf_amount = UsdCents::try_from_usd(dec!(10_000_000))?;
    let cf = app
        .credit()
        .initiate(&sub, customer_id, deposit_account_id, cf_amount, cf_terms)
        .await?;

    let disbursal_principal = UsdCents::try_from_usd(dec!(1_000_000))?;

    let mut stream = app.outbox().listen_persisted(None).await?;
    while let Some(msg) = stream.next().await {
        match &msg.payload {
            Some(LanaEvent::Credit(CoreCreditEvent::FacilityApproved { id })) if cf.id == *id => {
                app.credit()
                    .update_collateral(&sub, cf.id, Satoshis::try_from_btc(dec!(230))?)
                    .await?;
            }
            Some(LanaEvent::Credit(CoreCreditEvent::FacilityActivated { id, .. }))
                if cf.id == *id =>
            {
                app.credit()
                    .initiate_disbursal(&sub, cf.id, disbursal_principal)
                    .await?;
            }
            Some(LanaEvent::Credit(CoreCreditEvent::ObligationDue {
                credit_facility_id: id,
                amount,
                ..
            })) if {
                cf.id == *id && amount > &UsdCents::ZERO && *amount == disbursal_principal
            } =>
            {
                let late_app = app.clone();
                let late_id = *id;
                let late_amount = *amount;
                tokio::spawn(async move {
                    sim_time::sleep(std::time::Duration::from_secs(60 * 60 * 24 * 90)).await;
                    late_app
                        .credit()
                        .record_payment(&sub, late_id, late_amount)
                        .await
                        .expect("Failed to record payment");
                });
            }
            Some(LanaEvent::Credit(CoreCreditEvent::ObligationDue {
                credit_facility_id: id,
                amount,
                ..
            })) if {
                cf.id == *id && amount > &UsdCents::ZERO && *amount != disbursal_principal
            } =>
            {
                app.credit().record_payment(&sub, *id, *amount).await?;
                let facility = app
                    .credit()
                    .find_by_id(&sub, *id)
                    .await?
                    .expect("cf exists");
                if facility.interest_accrual_cycle_in_progress().is_none() {
                    let total_outstanding_amount = app.credit().outstanding(&facility).await?;
                    app.credit()
                        .record_payment(&sub, facility.id, total_outstanding_amount)
                        .await?;
                    app.credit().complete_facility(&sub, facility.id).await?;
                }
            }
            Some(LanaEvent::Credit(CoreCreditEvent::FacilityCompleted { id, .. })) => {
                if cf.id == *id {
                    break;
                }
            }
            _ => {}
        }
    }

    Ok(())
}
