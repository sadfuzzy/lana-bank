{{ config(materialized='table') }}

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
        sum(outstanding_interest) as outstanding_interest,

        safe_divide(safe_divide(
            sum(safe_multiply(diff, price)),
            sum(diff)
        ), 100.0) as average_initial_price_usd,
        array_agg(
            initial_collateral_value_usd
            order by recorded_at desc limit 1)[
            safe_ordinal(1)
        ] as initial_collateral_value_usd,
        array_agg(
            total_collateral_value_usd
            order by recorded_at desc limit 1)[
            safe_ordinal(1)
        ] as total_collateral_value_usd,
        array_agg(
            last_btc_price_usd
            order by recorded_at desc limit 1)[
            safe_ordinal(1)
        ] as last_btc_price_usd
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
        sum(disbursal_amount) as disbursal_amount,
        sum(interest_amount) as interest_amount
    from {{ ref('int_cf_payments') }}
    group by event_id

)

select
    cfe.*,
    d.* except (event_id),
    c.* except (event_id),

    p.* except (event_id),
    safe_multiply(
        safe_divide(c.total_collateral_value_usd, safe_divide(cfe.facility, 100.0)),
        100.0
    ) as facility_cvl,
    safe_multiply(
        safe_divide(c.initial_collateral_value_usd, safe_divide(cfe.facility, 100.0)),
        100.0
    ) as initial_facility_cvl,

    safe_multiply(
        safe_divide(c.total_collateral_value_usd, safe_divide(total_disbursed_amount, 100.0)),
        100.0
    ) as disbursed_cvl,
    safe_multiply(
        safe_divide(safe_multiply(cfe.terms_margin_call_cvl, cfe.facility), c.total_collateral),
        100000000.0 / (100.0 * 100.0)
    ) as facility_margin_call_price_usd,
    safe_multiply(
        safe_divide(
            safe_multiply(cfe.terms_margin_call_cvl, d.total_disbursed_amount), c.total_collateral
        ),
        100000000.0 / (100.0 * 100.0)
    ) as disbursed_margin_call_price_usd,
    safe_multiply(
        safe_divide(safe_multiply(cfe.terms_liquidation_cvl, cfe.facility), c.total_collateral),
        100000000.0 / (100.0 * 100.0)
    ) as facility_liquidation_price_usd,

    safe_multiply(
        safe_divide(
            safe_multiply(cfe.terms_liquidation_cvl, d.total_disbursed_amount), c.total_collateral
        ),
        100000000.0 / (100.0 * 100.0)
    ) as disbursed_liquidation_price_usd
from credit_facilities as cfe
full join int_cf_disbursals as d on cfe.event_id = d.event_id
full join int_cf_collaterals as c on cfe.event_id = c.event_id
full join int_cf_payments as p on cfe.event_id = p.event_id
