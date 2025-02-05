{{ config(materialized='table') }}

with flatten_collateral as (
    select *
    from {{ ref('int_cf_flatten') }}
),

collateral_quantity as (
    select safe_divide(sum(total_collateral), 100000000.0) as total_collateral_quantity_usd
    from flatten_collateral
    where completed_recorded_at is null
),

collateral_value as (
    select
        sum(total_collateral_value_usd) as total_collateral_value_usd,
        sum(initial_collateral_value_usd) as initial_collateral_value_usd
    from flatten_collateral
    where completed_recorded_at is null
),

value_approved_cf as (
    select safe_divide(sum(facility), 100.0) as total_value_approved_in_usd
    from flatten_collateral
    where
        approval_process_concluded_approved
        and completed_recorded_at is null
),

value_disbursed as (
    select safe_divide(sum(total_disbursed_amount), 100.0) as total_value_disbursed_in_usd
    from flatten_collateral
    where
        disbursal_concluded_event_recorded_at_date_key != 19000101
        and completed_recorded_at is null
),

agg_facility_cvl as (
    select
        safe_multiply(safe_divide(total_collateral_value_usd, total_value_approved_in_usd), 100.0)
            as aggregated_facility_cvl,
        safe_multiply(
            safe_divide(initial_collateral_value_usd, total_value_approved_in_usd), 100.0
        ) as aggregated_initial_facility_cvl
    from collateral_value, value_approved_cf
),

agg_disbursed_cvl as (
    select
        safe_multiply(
            safe_divide(total_collateral_value_usd, total_value_disbursed_in_usd), 100.0
        ) as aggregated_disbursed_cvl
    from collateral_value, value_disbursed
),

cvl_implied_prices as (
    select
        safe_divide(
            sum(safe_multiply(average_initial_price_usd, total_collateral)),
            sum(total_collateral)
        ) as aggregated_average_initial_price_usd,

        array_agg(
            last_btc_price_usd
            order by recorded_at desc limit 1)[
            safe_ordinal(1)
        ] as last_btc_price_usd,

        safe_divide(
            sum(safe_multiply(facility_margin_call_price_usd, total_collateral)),
            sum(total_collateral)
        ) as aggregated_facility_margin_call_price_usd,
        safe_divide(
            sum(safe_multiply(disbursed_margin_call_price_usd, total_collateral)),
            sum(total_collateral)
        ) as aggregated_disbursed_margin_call_price_usd,
        safe_divide(
            sum(safe_multiply(facility_liquidation_price_usd, total_collateral)),
            sum(total_collateral)
        ) as aggregated_facility_liquidation_price_usd,
        safe_divide(
            sum(safe_multiply(disbursed_liquidation_price_usd, total_collateral)),
            sum(total_collateral)
        ) as aggregated_disbursed_liquidation_price_usd
    from flatten_collateral
),

btc_price_simulation as (
    select *
    from {{ ref('int_btc_price_simulation') }}
),

sim_4s_implied_prices as (
    select
        sim.*,
        safe_multiply(safe_add(1.0, sim.period_1_day_loss_percent), px.last_btc_price_usd)
            as period_1_day_loss,
        safe_multiply(safe_add(1.0, sim.period_3_day_loss_percent), px.last_btc_price_usd)
            as period_3_day_loss,
        safe_multiply(safe_add(1.0, sim.period_1_week_loss_percent), px.last_btc_price_usd)
            as period_1_week_loss,
        safe_multiply(safe_add(1.0, sim.period_2_week_loss_percent), px.last_btc_price_usd)
            as period_2_week_loss,
        safe_multiply(safe_add(1.0, sim.period_3_week_loss_percent), px.last_btc_price_usd)
            as period_3_week_loss,
        safe_multiply(safe_add(1.0, sim.period_1_month_loss_percent), px.last_btc_price_usd)
            as period_1_month_loss
    from btc_price_simulation as sim, cvl_implied_prices as px
    where sim.sigma_level = 4
),

sim_5s_implied_prices as (
    select
        sim.*,
        safe_multiply(safe_add(1.0, sim.period_1_day_loss_percent), px.last_btc_price_usd)
            as period_1_day_loss,
        safe_multiply(safe_add(1.0, sim.period_3_day_loss_percent), px.last_btc_price_usd)
            as period_3_day_loss,
        safe_multiply(safe_add(1.0, sim.period_1_week_loss_percent), px.last_btc_price_usd)
            as period_1_week_loss
    from btc_price_simulation as sim, cvl_implied_prices as px
    where sim.sigma_level = 5
),

sim_6s_implied_prices as (
    select
        sim.*,
        safe_multiply(safe_add(1.0, sim.period_1_day_loss_percent), px.last_btc_price_usd)
            as period_1_day_loss,
        safe_multiply(safe_add(1.0, sim.period_3_day_loss_percent), px.last_btc_price_usd)
            as period_3_day_loss,
        safe_multiply(safe_add(1.0, sim.period_1_week_loss_percent), px.last_btc_price_usd)
            as period_1_week_loss
    from btc_price_simulation as sim, cvl_implied_prices as px
    where sim.sigma_level = 6
),

agg_liquidation_cash_flows_tvm_risk as (
    select *
    from {{ ref('int_cf_agg_liquidation_cash_flows_tvm_risk') }}
)


select
    10 as order_by,
    cast(total_collateral_quantity_usd as numeric) as the_value,
    'Total Quantity of Collateral (BTC)' as the_name
from collateral_quantity
union all
select
    20 as order_by,
    cast(initial_collateral_value_usd as numeric) as the_value,
    'Total Initial Value of Collateral (USD)' as the_name
from collateral_value
union all
select
    30 as order_by,
    cast(total_collateral_value_usd as numeric) as the_value,
    'Total Current Value of Collateral (USD)' as the_name
from collateral_value
union all
select
    40 as order_by,
    cast(total_value_approved_in_usd as numeric) as the_value,
    'Total Value of Approved Credit Facilities (USD)' as the_name
from value_approved_cf
union all
select
    50 as order_by,
    cast(aggregated_initial_facility_cvl as numeric) as the_value,
    'Aggregated Initial Facility CVL (%)' as the_name
from agg_facility_cvl
union all
select
    60 as order_by,
    cast(aggregated_facility_cvl as numeric) as the_value,
    'Aggregated Current Facility CVL (%)' as the_name
from agg_facility_cvl
union all
select
    70 as order_by,
    cast(total_value_disbursed_in_usd as numeric) as the_value,
    'Total Value Disbursed from Approved Credit Facilities (USD)' as the_name
from value_disbursed
union all
select
    80 as order_by,
    cast(aggregated_disbursed_cvl as numeric) as the_value,
    'Aggregated Disbursed CVL (%)' as the_name
from agg_disbursed_cvl
union all
select
    85 as order_by,
    cast(aggregated_average_initial_price_usd as numeric) as the_value,
    'Aggregated Average Initial Price (USD)' as the_name
from cvl_implied_prices
union all
select
    86 as order_by,
    cast(last_btc_price_usd as numeric) as the_value,
    'Current Price (USD)' as the_name
from cvl_implied_prices
union all
select
    90 as order_by,
    cast(aggregated_facility_margin_call_price_usd as numeric) as the_value,
    'Aggregated Facility Margin Call Price (USD)' as the_name
from cvl_implied_prices
union all
select
    91 as order_by,
    cast(
        safe_multiply(
            safe_subtract(
                safe_divide(aggregated_facility_margin_call_price_usd, last_btc_price_usd),
                1.0
            ),
            100.0
        ) as numeric
    ) as the_value,
    'Aggregated Facility Margin Call Price (%)' as the_name
from cvl_implied_prices
union all
select
    100 as order_by,
    cast(aggregated_disbursed_margin_call_price_usd as numeric) as the_value,
    'Aggregated Disbursed Margin Call Price (USD)' as the_name
from cvl_implied_prices
union all
select
    101 as order_by,
    cast(
        safe_multiply(
            safe_subtract(
                safe_divide(aggregated_disbursed_margin_call_price_usd, last_btc_price_usd),
                1.0
            ),
            100.0
        ) as numeric
    ) as the_value,
    'Aggregated Disbursed Margin Call Price (*)' as the_name
from cvl_implied_prices
union all
select
    110 as order_by,
    cast(aggregated_facility_liquidation_price_usd as numeric) as the_value,
    'Aggregated Facility Liquidation Price (USD)' as the_name
from cvl_implied_prices
union all
select
    111 as order_by,
    cast(
        safe_multiply(
            safe_subtract(
                safe_divide(aggregated_facility_liquidation_price_usd, last_btc_price_usd),
                1.0
            ),
            100.0
        ) as numeric
    ) as the_value,
    'Aggregated Facility Liquidation Price (%)' as the_name
from cvl_implied_prices
union all
select
    120 as order_by,
    cast(aggregated_disbursed_liquidation_price_usd as numeric) as the_value,
    'Aggregated Disbursed Liquidation Price (USD)' as the_name
from cvl_implied_prices
union all
select
    121 as order_by,
    cast(
        safe_multiply(
            safe_subtract(
                safe_divide(aggregated_disbursed_liquidation_price_usd, last_btc_price_usd),
                1.0
            ),
            100.0
        ) as numeric
    ) as the_value,
    'Aggregated Disbursed Liquidation Price (%)' as the_name
from cvl_implied_prices
union all
select
    124 as order_by,
    cast(max_disbursed_liquidation_price_usd as numeric) as the_value,
    'Highest Single Disbursed Liquidation Price (USD)' as the_name
from agg_liquidation_cash_flows_tvm_risk
union all
select
    125 as order_by,
    cast(avg_disbursed_liquidation_price_usd as numeric) as the_value,
    'Average Single Disbursed Liquidation Price (USD)' as the_name
from agg_liquidation_cash_flows_tvm_risk
union all
select
    126 as order_by,
    cast(min_disbursed_liquidation_price_usd as numeric) as the_value,
    'Lowest Single Disbursed Liquidation Price (USD)' as the_name
from agg_liquidation_cash_flows_tvm_risk
union all
select
    127 as order_by,
    cast(max_liquidation_pv_impact as numeric) as the_value,
    'Highest Price Liquidation Impact on PV (USD)' as the_name
from agg_liquidation_cash_flows_tvm_risk
union all
select
    128 as order_by,
    cast(avg_liquidation_pv_impact as numeric) as the_value,
    'Average Price Liquidation Impact on PV (USD)' as the_name
from agg_liquidation_cash_flows_tvm_risk
union all
select
    129 as order_by,
    cast(min_liquidation_pv_impact as numeric) as the_value,
    'Lowest Price Liquidation Impact on PV (USD)' as the_name
from agg_liquidation_cash_flows_tvm_risk
union all
select
    130 as order_by,
    cast(period_1_day_loss as numeric) as the_value,
    'Simulated ' || sigma_level || 'σ, 1-day Price (USD)' as the_name
from sim_4s_implied_prices
union all
select
    131 as order_by,
    cast(safe_multiply(period_1_day_loss_percent, 100.0) as numeric) as the_value,
    'Simulated ' || sigma_level || 'σ, 1-day Price (%)' as the_name
from sim_4s_implied_prices
union all
select
    132 as order_by,
    cast(period_1_day_loss as numeric) as the_value,
    'Simulated ' || sigma_level || 'σ, 1-day Price (USD)' as the_name
from sim_5s_implied_prices
union all
select
    133 as order_by,
    cast(safe_multiply(period_1_day_loss_percent, 100.0) as numeric) as the_value,
    'Simulated ' || sigma_level || 'σ, 1-day Price (%)' as the_name
from sim_5s_implied_prices
union all
select
    134 as order_by,
    cast(period_1_day_loss as numeric) as the_value,
    'Simulated ' || sigma_level || 'σ, 1-day Price (USD)' as the_name
from sim_6s_implied_prices
union all
select
    135 as order_by,
    cast(safe_multiply(period_1_day_loss_percent, 100.0) as numeric) as the_value,
    'Simulated ' || sigma_level || 'σ, 1-day Price (%)' as the_name
from sim_6s_implied_prices
union all
select
    140 as order_by,
    cast(period_3_day_loss as numeric) as the_value,
    'Simulated ' || sigma_level || 'σ, 3-day Price (USD)' as the_name
from sim_4s_implied_prices
union all
select
    141 as order_by,
    cast(safe_multiply(period_3_day_loss_percent, 100.0) as numeric) as the_value,
    'Simulated ' || sigma_level || 'σ, 3-day Price (%)' as the_name
from sim_4s_implied_prices
union all
select
    142 as order_by,
    cast(period_3_day_loss as numeric) as the_value,
    'Simulated ' || sigma_level || 'σ, 3-day Price (USD)' as the_name
from sim_5s_implied_prices
union all
select
    143 as order_by,
    cast(safe_multiply(period_3_day_loss_percent, 100.0) as numeric) as the_value,
    'Simulated ' || sigma_level || 'σ, 3-day Price (%)' as the_name
from sim_5s_implied_prices
union all
select
    144 as order_by,
    cast(period_3_day_loss as numeric) as the_value,
    'Simulated ' || sigma_level || 'σ, 3-day Price (USD)' as the_name
from sim_6s_implied_prices
union all
select
    145 as order_by,
    cast(safe_multiply(period_3_day_loss_percent, 100.0) as numeric) as the_value,
    'Simulated ' || sigma_level || 'σ, 3-day Price (%)' as the_name
from sim_6s_implied_prices
union all
select
    150 as order_by,
    cast(period_1_week_loss as numeric) as the_value,
    'Simulated ' || sigma_level || 'σ, 1-week Price (USD)' as the_name
from sim_4s_implied_prices
union all
select
    151 as order_by,
    cast(safe_multiply(period_1_week_loss_percent, 100.0) as numeric) as the_value,
    'Simulated ' || sigma_level || 'σ, 1-week Price (%)' as the_name
from sim_4s_implied_prices
union all
select
    152 as order_by,
    cast(period_1_week_loss as numeric) as the_value,
    'Simulated ' || sigma_level || 'σ, 1-week Price (USD)' as the_name
from sim_5s_implied_prices
union all
select
    153 as order_by,
    cast(safe_multiply(period_1_week_loss_percent, 100.0) as numeric) as the_value,
    'Simulated ' || sigma_level || 'σ, 1-week Price (%)' as the_name
from sim_5s_implied_prices
union all
select
    154 as order_by,
    cast(period_1_week_loss as numeric) as the_value,
    'Simulated ' || sigma_level || 'σ, 1-week Price (USD)' as the_name
from sim_6s_implied_prices
union all
select
    155 as order_by,
    cast(safe_multiply(period_1_week_loss_percent, 100.0) as numeric) as the_value,
    'Simulated ' || sigma_level || 'σ, 1-week Price (%)' as the_name
from sim_6s_implied_prices
union all
select
    160 as order_by,
    cast(period_2_week_loss as numeric) as the_value,
    'Simulated ' || sigma_level || 'σ, 2-week Price (USD)' as the_name
from sim_4s_implied_prices
union all
select
    161 as order_by,
    cast(safe_multiply(period_2_week_loss_percent, 100.0) as numeric) as the_value,
    'Simulated ' || sigma_level || 'σ, 2-week Price (%)' as the_name
from sim_4s_implied_prices
union all
select
    170 as order_by,
    cast(period_3_week_loss as numeric) as the_value,
    'Simulated ' || sigma_level || 'σ, 3-week Price (USD)' as the_name
from sim_4s_implied_prices
union all
select
    171 as order_by,
    cast(safe_multiply(period_3_week_loss_percent, 100.0) as numeric) as the_value,
    'Simulated ' || sigma_level || 'σ, 3-week Price (%)' as the_name
from sim_4s_implied_prices
union all
select
    180 as order_by,
    cast(period_1_month_loss as numeric) as the_value,
    'Simulated ' || sigma_level || 'σ, 1-month Price (USD)' as the_name
from sim_4s_implied_prices
union all
select
    181 as order_by,
    cast(safe_multiply(period_1_month_loss_percent, 100.0) as numeric) as the_value,
    'Simulated ' || sigma_level || 'σ, 1-month Price (%)' as the_name
from sim_4s_implied_prices

order by order_by
