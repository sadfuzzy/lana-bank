with credit_facilities as (

    select * from {{ ref('int_credit_facilities') }}

),

int_cf_disbursals as (

    select
        event_id,
        max(recorded_at_date_key) as disbursal_recorded_at_date_key,
        max(recorded_at) as disbursal_recorded_at,
        max(disbursal_concluded_event_recorded_at_date_key)
            as disbursal_concluded_event_recorded_at_date_key,
        max(disbursal_concluded_event_recorded_at)
            as disbursal_concluded_event_recorded_at,
        sum(amount) as total_disbursed_amount
    from {{ ref('int_cf_disbursals') }}
    group by event_id

),

int_cf_collaterals as (

    select
        event_id,
        max(recorded_at_date_key) as collateral_recorded_at_date_key,
        max(recorded_at) as collateral_recorded_at,

        max(recorded_in_ledger_at_date_key) as recorded_in_ledger_at_date_key,
        max(recorded_in_ledger_at) as recorded_in_ledger_at,
        max(collateralization_changed_event_recorded_at_date_key)
            as collateralization_changed_event_recorded_at_date_key,
        max(collateralization_changed_event_recorded_at)
            as collateralization_changed_event_recorded_at,

        array_agg(
            collateralization_changed_state
            order by collateralization_changed_event_recorded_at desc limit 1
        )[safe_ordinal(1)] as collateralization_changed_state,

        sum(diff) as total_collateral_summed,
        array_agg(
            total_collateral
            order by recorded_at desc limit 1)[
            safe_ordinal(1)
        ] as total_collateral,

        sum(outstanding_disbursed) as outstanding_disbursed,
        sum(outstanding_interest) as outstanding_interest
    from {{ ref('int_cf_collaterals') }}
    group by event_id

),

int_cf_payments as (

    select
        event_id,
        max(recorded_at_date_key) as payment_recorded_at_date_key,
        max(recorded_at) as payment_recorded_at,
        max(recorded_in_ledger_at_date_key)
            as payment_recorded_in_ledger_at_date_key,
        max(recorded_in_ledger_at) as payment_recorded_in_ledger_at,
        sum(disbursement_amount) as disbursement_amount,
        sum(interest_amount) as interest_amount
    from {{ ref('int_cf_payments') }}
    group by event_id

)

select
    cfe.*,
    d.* except (event_id),
    c.* except (event_id),
    p.* except (event_id)
from credit_facilities as cfe
full join int_cf_disbursals as d on cfe.event_id = d.event_id
full join int_cf_collaterals as c on cfe.event_id = c.event_id
full join int_cf_payments as p on cfe.event_id = p.event_id
