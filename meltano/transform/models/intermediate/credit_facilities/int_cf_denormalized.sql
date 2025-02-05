{{ config(materialized='table') }}

with credit_facilities as (

    select * from {{ ref('int_credit_facilities') }}

),

int_cf_disbursals as (

    select * from {{ ref('int_cf_disbursals') }}

),

int_cf_collaterals as (

    select * from {{ ref('int_cf_collaterals') }}

),

int_cf_payments as (

    select * from {{ ref('int_cf_payments') }}

)

select
    cfe.*,

    d.* except (event_id, recorded_at_date_key, recorded_at, event_type),
    c.* except (event_id, recorded_at_date_key, recorded_at, event_type),

    p.* except (
        event_id,
        recorded_at_date_key,
        recorded_at,
        event_type,
        recorded_in_ledger_at_date_key,
        recorded_in_ledger_at
    ),
    d.recorded_at_date_key as disbursal_recorded_at_date_key,
    d.recorded_at as disbursal_recorded_at,

    d.event_type as disbursal_event_type,
    c.recorded_at_date_key as collateral_recorded_at_date_key,
    c.recorded_at as collateral_recorded_at,
    c.event_type as collateral_event_type,

    p.recorded_at_date_key as payment_recorded_at_date_key,
    p.recorded_at as payment_recorded_at,

    p.event_type as payment_event_type,
    p.recorded_in_ledger_at_date_key as payment_recorded_in_ledger_at_date_key,
    p.recorded_in_ledger_at as payment_recorded_in_ledger_at,
    safe_multiply(
        safe_divide(c.total_collateral_value_usd, safe_divide(cfe.facility, 100.0)),
        100.0
    ) as facility_cvl,

    safe_multiply(
        safe_divide(c.initial_collateral_value_usd, safe_divide(cfe.facility, 100.0)),
        100.0
    ) as initial_facility_cvl,
    safe_multiply(
        safe_divide(c.total_collateral_value_usd, safe_divide(d.amount, 100.0)),
        100.0
    ) as disbursed_cvl,
    safe_multiply(
        safe_divide(safe_multiply(cfe.terms_margin_call_cvl, cfe.facility), c.total_collateral),
        100000000.0 / (100.0 * 100.0)
    ) as facility_margin_call_price_usd,
    safe_multiply(
        safe_divide(safe_multiply(cfe.terms_margin_call_cvl, d.amount), c.total_collateral),
        100000000.0 / (100.0 * 100.0)
    ) as disbursed_margin_call_price_usd,
    safe_multiply(
        safe_divide(safe_multiply(cfe.terms_liquidation_cvl, cfe.facility), c.total_collateral),
        100000000.0 / (100.0 * 100.0)
    ) as facility_liquidation_price_usd,
    safe_multiply(
        safe_divide(safe_multiply(cfe.terms_liquidation_cvl, d.amount), c.total_collateral),
        100000000.0 / (100.0 * 100.0)
    ) as disbursed_liquidation_price_usd
from credit_facilities as cfe
full join int_cf_disbursals as d on cfe.event_id = d.event_id
full join int_cf_collaterals as c on cfe.event_id = c.event_id
full join int_cf_payments as p on cfe.event_id = p.event_id
