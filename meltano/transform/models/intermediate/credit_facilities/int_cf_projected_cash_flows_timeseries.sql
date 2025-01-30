with projected_cash_flows_common as (
    select *
    from {{ ref('int_cf_projected_cash_flows_common') }}
),

grouped as (
    select
        customer_id,
        event_id,
        credit_facility_start_date,
        credit_facility_end_date,
        now_ts,
        days_per_year,
        bench_mark_daily_interest_rate,
        days_from_now,
        sum(projected_disbursal_amount_in_cents)
            as projected_disbursal_amount_in_cents,
        sum(projected_payment_amount_in_cents)
            as projected_payment_amount_in_cents
    from projected_cash_flows_common
    group by
        customer_id,
        event_id,
        credit_facility_start_date,
        credit_facility_end_date,
        now_ts,
        days_per_year,
        bench_mark_daily_interest_rate,
        days_from_now
    order by days_from_now
)

select
    *,
    timestamp(
        timestamp_add(date(now_ts), interval cast(days_from_now as int64) day)
    ) as date_from_now,
    safe_divide(projected_disbursal_amount_in_cents, 100.0)
        as projected_disbursal_amount_in_usd,
    safe_divide(projected_payment_amount_in_cents, 100.0)
        as projected_payment_amount_in_usd
from grouped
