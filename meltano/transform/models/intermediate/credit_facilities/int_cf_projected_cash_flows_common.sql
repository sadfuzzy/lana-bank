with terms_and_disbursal as (
    select
        *,
        facility as credit_facility_limit_in_cents,
        'actual/360' as credit_facility_day_count_convention,
        -- TODO get from proper source
        amount as disbursal_amount_in_cents,
        -- TODO get from proper source
        disbursal_concluded_event_recorded_at as disbursal_start_date,
        safe_divide(terms_annual_rate, 100.0)
            as credit_facility_annual_interest_rate,
        5.53 / 100.0 as bench_mark_interest_rate,
        timestamp(current_date()) as now_ts,
        timestamp(date(activated_recorded_at)) as credit_facility_start_date,
        case
            when terms_duration_type = 'months' then
                timestamp(
                    timestamp_add(
                        date(activated_recorded_at),
                        interval terms_duration_value month
                    )
                )
        end as credit_facility_end_date
    from {{ ref('int_cf_denormalized') }}
    where
        disbursal_concluded_event_recorded_at_date_key != 19000101
        and terms_accrual_interval_type = 'end_of_month'
),

projections as (
    select
        *,
        safe_divide(
            credit_facility_annual_interest_rate,
            case
                when
                    ends_with(credit_facility_day_count_convention, '/360')
                    then 360.0
                when
                    ends_with(credit_facility_day_count_convention, '/365')
                    then 365.0
                else
                    timestamp_diff(
                        timestamp(
                            last_day(date(credit_facility_start_date), year)
                        ),
                        date_trunc(credit_facility_start_date, year),
                        day
                    )
            end
        ) as credit_facility_daily_interest_rate,
        safe_divide(
            bench_mark_interest_rate,
            case
                when
                    ends_with(credit_facility_day_count_convention, '/360')
                    then 360.0
                when
                    ends_with(credit_facility_day_count_convention, '/365')
                    then 365.0
                else
                    timestamp_diff(
                        timestamp(
                            last_day(date(credit_facility_start_date), year)
                        ),
                        date_trunc(credit_facility_start_date, year),
                        day
                    )
            end
        ) as bench_mark_daily_interest_rate,
        case
            when
                ends_with(credit_facility_day_count_convention, '/360')
                then 360.0
            when
                ends_with(credit_facility_day_count_convention, '/365')
                then 365.0
            else
                timestamp_diff(
                    timestamp(last_day(date(credit_facility_start_date), year)),
                    date_trunc(credit_facility_start_date, year),
                    day
                )
        end as days_per_year,
        safe_divide(
            bench_mark_interest_rate, credit_facility_annual_interest_rate
        ) as breakeven_disbursal_percent,
        safe_multiply(
            credit_facility_limit_in_cents,
            safe_divide(
                bench_mark_interest_rate, credit_facility_annual_interest_rate
            )
        ) as breakeven_disbursal_amount_in_cents,
        case
            when terms_accrual_interval_type = 'end_of_day'
                then
                    generate_date_array(
                        date(disbursal_start_date),
                        last_day(date(credit_facility_end_date)),
                        interval 1 day
                    )
            when terms_accrual_interval_type = 'end_of_month' then
                generate_date_array(
                    date(disbursal_start_date),
                    last_day(date(credit_facility_end_date)),
                    interval 1 month
                )
        end as interest_schedule_months
    from terms_and_disbursal
),

projected_interest_payment_data as (
    select
        p.* except (interest_schedule_months),
        case
            when
                timestamp(date_trunc(projected_month, month))
                < disbursal_start_date
                then
                    timestamp(date(disbursal_start_date))
            else
                timestamp(date_trunc(projected_month, month))
        end as period_start_date,
        case
            when last_day(projected_month) > date(credit_facility_end_date)
                then
                    timestamp(date(credit_facility_end_date))
            else
                timestamp(last_day(projected_month))
        end as period_end_date,
        'projected_interest_payment' as payment_type
    from projections as p,
        unnest(interest_schedule_months) as projected_month
),

projected_principal_payment_data as (
    select
        * except (interest_schedule_months),
        timestamp(date(disbursal_start_date)) as period_start_date,
        timestamp(date(credit_facility_end_date)) as period_end_date,
        'projected_principal_payment' as payment_type
    from projections
),

projected_disbursal_data as (
    select
        * except (interest_schedule_months),
        timestamp(date(now_ts)) as period_start_date,
        timestamp(timestamp_add(date(disbursal_start_date), interval -1 day))
            as period_end_date,
        'projected_disbursal' as payment_type
    from projections
),

projected_payment_data as (
    select * from projected_interest_payment_data
    union all
    select * from projected_principal_payment_data
    union all
    select * from projected_disbursal_data
),

projected_time_data as (
    select
        *,
        cast(
            timestamp_diff(date(period_end_date), date(now_ts), day)
            + 1 as float64
        ) as days_from_now,
        timestamp_diff(date(period_end_date), date(period_start_date), day)
        + 1 as days_in_the_period
    from projected_payment_data
),

projected_cash_flows_common as (
    select
        customer_id,
        event_id,
        idx as disbursal_idx,
        credit_facility_start_date,
        credit_facility_end_date,
        bench_mark_interest_rate,
        bench_mark_daily_interest_rate,
        credit_facility_annual_interest_rate,
        credit_facility_daily_interest_rate,
        now_ts,
        days_per_year,
        days_in_the_period,
        days_from_now,
        case
            when payment_type = 'projected_disbursal'
                then cast(safe_negate(disbursal_amount_in_cents) as float64)
            else 0
        end as projected_disbursal_amount_in_cents,
        case
            when payment_type = 'projected_interest_payment'
                then
                    safe_multiply(
                        disbursal_amount_in_cents,
                        safe_multiply(
                            credit_facility_daily_interest_rate,
                            days_in_the_period
                        )
                    )
            when payment_type = 'projected_principal_payment'
                then disbursal_amount_in_cents
            else 0
        end as projected_payment_amount_in_cents
    from projected_time_data
)

select *
from projected_cash_flows_common
