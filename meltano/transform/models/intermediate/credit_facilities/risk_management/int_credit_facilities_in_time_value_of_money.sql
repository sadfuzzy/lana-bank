{{ config(materialized='table') }}

with final as (
    select * from {{ ref("int_cf_agg_projected_cash_flows_tvm_risk") }}
)


select
    0 as order_by,
    cast(disbursal_pv as numeric) as the_value,
    'Present Value of disbursal cashflows' as the_name
from final
union all
select
    1 as order_by,
    cast(pv as numeric) as the_value,
    'Present Value of future cashflows' as the_name
from final
union all
select
    2 as order_by,
    cast(npv as numeric) as the_value,
    'Net Present Value of disbursal & future cashflows' as the_name
from final
union all
select
    3 as order_by,
    cast(ytm as numeric) as the_value,
    'YTM' as the_name
from final
union all
select
    4 as order_by,
    cast(ytm_from_price as numeric) as the_value,
    'YTM @ disbursal pv' as the_name
from final
union all
select
    5 as order_by,
    cast(mac_duration as numeric) as the_value,
    'MacDuration' as the_name
from final
union all
select
    6 as order_by,
    cast(format_date('%Y%m%d', mac_duration_date) as numeric) as the_value,
    'MacDurationDate' as the_name
from final
union all
select
    7 as order_by,
    cast(dv01 as numeric) as the_value,
    'DV01' as the_name
from final
union all
select
    8 as order_by,
    cast(pv_at_dv01 as numeric) as the_value,
    'PV @ DV01' as the_name
from final

order by order_by
