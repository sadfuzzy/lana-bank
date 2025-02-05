with approved as (

    select distinct id as credit_facility_id

    from {{ ref('stg_credit_facility_events') }}

    where
        event_type = "approval_process_concluded"
        and json_value(event, "$.approved") = "true"

),

initial as (

    select distinct
        id as credit_facility_id,
        cast(json_value(event, "$.facility") as numeric) as facility,
        recorded_at as initialized_at,
        cast(json_value(event, "$.terms.annual_rate") as numeric)
            as annual_rate,
        case
            when json_value(event, "$.terms.duration.type") = "months"
                then timestamp_add(
                    date(recorded_at),
                    interval cast(
                        json_value(event, "$.terms.duration.value") as integer
                    ) month
                )
        end as end_date,
        json_value(event, "$.terms.incurrence_interval.type")
            as incurrence_interval,
        json_value(event, "$.terms.accrual_interval.type") as accrual_interval,
        json_value(event, "$.customer_id") as customer_id,
        json_value(
            event, "$.customer_account_ids.on_balance_sheet_deposit_account_id"
        ) as on_balance_sheet_deposit_account_id,
        json_value(event, "$.account_ids.collateral_account_id")
            as collateral_account_id,
        json_value(event, "$.account_ids.disbursed_receivable_account_id")
            as disbursed_receivable_account_id,
        json_value(event, "$.account_ids.facility_account_id")
            as facility_account_id,
        json_value(event, "$.account_ids.fee_income_account_id")
            as fee_income_account_id,
        json_value(event, "$.account_ids.interest_account_id")
            as interest_account_id,
        json_value(event, "$.account_ids.interest_receivable_account_id")
            as interest_receivable_account_id

    from {{ ref('stg_credit_facility_events') }}

    where event_type = "initialized"

),

payments as (

    select
        id as credit_facility_id,
        sum(cast(json_value(event, "$.interest_amount") as numeric))
            as total_interest_paid,
        sum(cast(json_value(event, "$.disbursal_amount") as numeric))
            as total_disbursement_paid,
        max(
            if(
                coalesce(
                    cast(json_value(event, "$.interest_amount") as numeric), 0
                )
                > 0,
                recorded_at,
                null
            )
        ) as most_recent_interest_payment_timestamp,
        max(
            if(
                coalesce(
                    cast(json_value(event, "$.disbursal_amount") as numeric),
                    0
                )
                > 0,
                recorded_at,
                null
            )
        ) as most_recent_disbursement_payment_timestamp

    from {{ ref('stg_credit_facility_events') }}

    where event_type = "payment_recorded"

    group by credit_facility_id

),

interest as (

    select
        id as credit_facility_id,
        sum(cast(json_value(event, "$.amount") as numeric))
            as total_interest_incurred

    from {{ ref('stg_credit_facility_events') }}

    where event_type = "interest_accrual_concluded"

    group by credit_facility_id

),

collateral as (

    select
        id as credit_facility_id,
        cast(
            json_value(
                any_value(event having max recorded_at),
                "$.total_collateral"
            )
            as numeric
        ) as total_collateral

    from {{ ref('stg_credit_facility_events') }}

    where event_type = "collateral_updated"

    group by credit_facility_id

),

collateral_deposits as (

    select
        id as credit_facility_id,
        parse_timestamp(
            "%Y-%m-%dT%H:%M:%E6SZ",
            json_value(
                any_value(event having max recorded_at),
                "$.recorded_at"
            ),
            "UTC"
        ) as most_recent_collateral_deposit

    from {{ ref('stg_credit_facility_events') }}

    where
        event_type = "collateral_updated"
        and json_value(event, "$.action") = "Add"

    group by credit_facility_id

),

disbursements as (

    select
        id as credit_facility_id,
        sum(cast(json_value(event, "$.amount") as numeric)) as total_disbursed

    from {{ ref('stg_credit_facility_events') }}

    where event_type = "disbursal_initiated"

    group by credit_facility_id

),

completed as (

    select distinct id as credit_facility_id

    from {{ ref('stg_credit_facility_events') }}

    where event_type = "completed"

)

select
    credit_facility_id,
    initialized_at,
    end_date,
    incurrence_interval,
    accrual_interval,
    most_recent_interest_payment_timestamp,
    most_recent_disbursement_payment_timestamp,
    annual_rate,
    customer_id,
    on_balance_sheet_deposit_account_id,
    collateral_account_id,
    disbursed_receivable_account_id,
    facility_account_id,
    fee_income_account_id,
    interest_account_id,
    interest_receivable_account_id,
    most_recent_collateral_deposit,
    row_number() over () as credit_facility_key,
    coalesce(facility, 0) as facility,
    coalesce(total_interest_paid, 0) as total_interest_paid,
    coalesce(total_disbursement_paid, 0) as total_disbursement_paid,
    coalesce(total_interest_incurred, 0) as total_interest_incurred,
    coalesce(total_collateral, 0) as total_collateral,
    coalesce(total_disbursed, 0) as total_disbursed,
    completed.credit_facility_id is not null as completed

from approved
inner join initial using (credit_facility_id)
left join payments using (credit_facility_id)
left join interest using (credit_facility_id)
left join collateral using (credit_facility_id)
left join collateral_deposits using (credit_facility_id)
left join disbursements using (credit_facility_id)
left join completed using (credit_facility_id)
