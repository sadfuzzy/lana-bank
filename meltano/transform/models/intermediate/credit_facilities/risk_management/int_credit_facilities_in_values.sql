{{ config(materialized='table') }}

with value_approved_cf as (
    select safe_divide(sum(facility), 100.0) as amount_in_usd
    from {{ ref("int_credit_facilities") }}
    where
        approval_process_concluded_approved
        and completed_recorded_at is null
),

disbursed as (
    select safe_divide(sum(total_disbursed_amount), 100.0) as amount_in_usd
    from {{ ref("int_cf_flatten") }}
    where
        disbursal_concluded_event_recorded_at_date_key != 19000101
        and completed_recorded_at is null
),

breakeven as (
    select
        cfe.event_id,
        5.53 as bench_mark,              	      -- TODO get from proper source
        cfe.terms_annual_rate,
        facility as credit_facility_limit_in_cents,
        coalesce(total_disbursed_amount, 0) as disbursal_amount_in_cents
    from {{ ref("int_cf_flatten") }} as cfe
    where
        approval_process_concluded_approved
        and completed_recorded_at is null
        and facility > 0
),

breakeven_by_cf as (
    select
        event_id,
        bench_mark,
        terms_annual_rate,
        credit_facility_limit_in_cents,
        sum(disbursal_amount_in_cents) as disbursal_amount_in_cents
    from breakeven
    group by
        event_id,
        bench_mark,
        terms_annual_rate,
        credit_facility_limit_in_cents
),

breakeven_ratio as (
    select
        event_id,
        bench_mark,
        terms_annual_rate,
        disbursal_amount_in_cents,
        credit_facility_limit_in_cents,
        bench_mark / 100.0 as bench_mark_interest_rate,
        safe_divide(
            credit_facility_limit_in_cents,
            sum(credit_facility_limit_in_cents) over ()
        ) as facility_limit_ratio,
        safe_divide(disbursal_amount_in_cents, credit_facility_limit_in_cents)
            as disbursal_ratio,
        safe_divide(bench_mark, terms_annual_rate) as breakeven_disbursal_ratio
    from breakeven_by_cf
),

breakeven_prop as (
    select
        event_id,
        bench_mark,
        terms_annual_rate,
        disbursal_amount_in_cents,
        credit_facility_limit_in_cents,
        bench_mark_interest_rate,
        facility_limit_ratio,
        disbursal_ratio,
        breakeven_disbursal_ratio,
        safe_multiply(breakeven_disbursal_ratio, facility_limit_ratio)
            as prop_breakeven_disbursal_ratio,
        safe_multiply(disbursal_ratio, facility_limit_ratio)
            as prop_disbursal_ratio
    from breakeven_ratio
),

breakeven_sum as (
    select
        bench_mark,
        sum(prop_breakeven_disbursal_ratio) as breakeven_disbursal_ratio,
        sum(prop_disbursal_ratio) as disbursal_ratio
    from breakeven_prop
    group by bench_mark
)


select
    1 as order_by,
    cast(amount_in_usd as numeric) as the_value,
    'Total Value of Approved Credit Facilities' as the_name
from value_approved_cf
union all
select
    2 as order_by,
    cast(amount_in_usd as numeric) as the_value,
    'Total Value Disbursed from Approved Credit Facilities' as the_name
from disbursed
union all
select
    3 as order_by,
    cast(safe_subtract(v.amount_in_usd, d.amount_in_usd) as numeric) as the_value,
    'Total Value NOT-YET Disbursed from Approved Credit Facilities' as the_name
from value_approved_cf as v, disbursed as d
union all
select
    4 as order_by,
    cast(safe_divide(d.amount_in_usd, v.amount_in_usd) * 100 as numeric) as the_value,
    'Disbursed-to-Approved ratio (%)' as the_name
from value_approved_cf as v, disbursed as d
union all
select
    5 as order_by,
    cast(disbursal_ratio * 100 as numeric) as the_value,
    'Disbursal ratio (%) - proportional' as the_name
from breakeven_sum
union all
select
    6 as order_by,
    cast(breakeven_disbursal_ratio * 100 as numeric) as the_value,
    'Breakeven ratio (%) - proportional @' || bench_mark || '% benchmark' as the_name
from breakeven_sum

order by order_by
