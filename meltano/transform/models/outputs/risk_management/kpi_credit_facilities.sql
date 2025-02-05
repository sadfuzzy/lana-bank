with this as (
    select
        the_name,
        the_value,
        order_by,
        1 as rpt_order
    from {{ ref('int_customers_in_numbers') }}
    union all
    select
        the_name,
        the_value,
        order_by,
        2 as rpt_order
    from {{ ref('int_credit_facilities_in_numbers') }}
    union all
    select
        the_name,
        the_value,
        order_by,
        3 as rpt_order
    from {{ ref('int_credit_facilities_in_values') }}
    union all
    select
        the_name,
        the_value,
        order_by,
        4 as rpt_order
    from {{ ref('int_credit_facilities_in_time_value_of_money') }}
    union all
    select
        the_name,
        the_value,
        order_by,
        4 as rpt_order
    from {{ ref('int_credit_facilities_collateral_in_values') }}
    order by rpt_order, order_by
)

select
    the_name,
    the_value
from this
