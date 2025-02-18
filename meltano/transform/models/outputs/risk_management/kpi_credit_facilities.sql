with this as (
    select
        kpi_title,
        kpi_name,
        kpi_value,
        order_by,
        1 as rpt_order
    from {{ ref('int_customers_in_numbers') }}
    union all
    select
        kpi_title,
        kpi_name,
        kpi_value,
        order_by,
        2 as rpt_order
    from {{ ref('int_credit_facilities_in_numbers') }}
    union all
    select
        kpi_title,
        kpi_name,
        kpi_value,
        order_by,
        3 as rpt_order
    from {{ ref('int_credit_facilities_in_values') }}
    union all
    select
        kpi_title,
        kpi_name,
        kpi_value,
        order_by,
        4 as rpt_order
    from {{ ref('int_credit_facilities_in_time_value_of_money') }}
    union all
    select
        kpi_title,
        kpi_name,
        kpi_value,
        order_by,
        4 as rpt_order
    from {{ ref('int_credit_facilities_collateral_in_values') }}
    order by rpt_order, order_by
)

select
    kpi_title,
    kpi_name,
    kpi_value
from this
