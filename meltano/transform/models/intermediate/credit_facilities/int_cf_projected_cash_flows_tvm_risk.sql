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
        case
            when days_from_now < 0 then 0 else
                sum(projected_payment_amount_in_cents)
        end as projected_payment_amount_in_cents
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
),

arrayed as (
    select
        customer_id,
        event_id,
        credit_facility_start_date,
        credit_facility_end_date,
        now_ts,
        days_per_year,
        bench_mark_daily_interest_rate,
        array_agg(projected_disbursal_amount_in_cents)
            as projected_disbursal_amount_in_cents,
        array_agg(days_from_now) as days_from_now,
        array_agg(projected_payment_amount_in_cents) as cash_flows
    from grouped
    group by
        customer_id,
        event_id,
        credit_facility_start_date,
        credit_facility_end_date,
        now_ts,
        days_per_year,
        bench_mark_daily_interest_rate
),

with_risk as (
    select
        customer_id,
        event_id,
        credit_facility_start_date,
        credit_facility_end_date,
        now_ts,
        days_per_year,
        bench_mark_daily_interest_rate,
        projected_disbursal_amount_in_cents,
        days_from_now,
        cash_flows,
        {{ target.schema }}.udf_loan_pv(
            bench_mark_daily_interest_rate,
            days_from_now,
            projected_disbursal_amount_in_cents
        ) as disbursal_pv,
        {{ target.schema }}.udf_loan_pv(
            bench_mark_daily_interest_rate, days_from_now, cash_flows
        ) as pv,
        safe_multiply(
            {{ target.schema }}.udf_loan_ytm(
                bench_mark_daily_interest_rate, days_from_now, cash_flows
            ),
            365.0
        ) as ytm,
        {{ target.schema }}.udf_loan_mac_duration(
            bench_mark_daily_interest_rate, days_from_now, cash_flows
        ) as mac_duration,
        safe_divide(
            {{ target.schema }}.udf_loan_mod_duration(
                bench_mark_daily_interest_rate, days_from_now, cash_flows
            ),
            365.0
        ) as mod_duration,
        safe_divide(
            {{ target.schema }}.udf_loan_convexity(
                bench_mark_daily_interest_rate, days_from_now, cash_flows
            ),
            365.0 * 365.0
        ) as convexity,
        {{ target.schema }}.udf_loan_pv_delta_on_interest_rate_delta_with_convex(
            bench_mark_daily_interest_rate,
            days_from_now,
            cash_flows,
            0.0001 / days_per_year
        ) as dv01,
        {{ target.schema }}.udf_loan_pv(
            bench_mark_daily_interest_rate + (0.0001 / days_per_year),
            days_from_now,
            cash_flows
        ) as pv_at_dv01
    from arrayed
),

final as (
    select
        customer_id,
        event_id,
        credit_facility_start_date,
        credit_facility_end_date,
        now_ts,
        days_per_year,
        bench_mark_daily_interest_rate,
        projected_disbursal_amount_in_cents,
        days_from_now,
        cash_flows,
        safe_divide(disbursal_pv, 100.0) as disbursal_pv,
        safe_divide(pv, 100.0) as pv,
        safe_divide(
            safe_add(
                {{ target.schema }}.udf_loan_pv(
                    bench_mark_daily_interest_rate, days_from_now, cash_flows
                ),
                disbursal_pv
            ),
            100.0
        ) as npv,
        ytm,
        safe_multiply(
            {{ target.schema }}.udf_loan_ytm_from_price(
                safe_negate(disbursal_pv), days_from_now, cash_flows
            ),
            365.0
        ) as ytm_from_price,
        mac_duration,
        case
            when is_nan(mac_duration)
                then timestamp('1900-01-01')
            else
                timestamp(
                    timestamp_add(
                        date(now_ts), interval cast(mac_duration as int64) day
                    )
                )
        end as mac_duration_date,
        safe_divide(dv01, 100.0) as dv01,
        safe_divide(pv_at_dv01, 100.0) as pv_at_dv01
    from with_risk
)

select * from final
