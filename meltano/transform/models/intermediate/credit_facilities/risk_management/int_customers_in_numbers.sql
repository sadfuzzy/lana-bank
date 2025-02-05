{{ config(materialized='table') }}

with total_customers as (
    select count(distinct customer_id) as the_value
    from {{ ref("int_credit_facilities") }}
),

total_active_customers as (
    select count(distinct customer_id) as the_value
    from {{ ref("int_credit_facilities") }}
    where completed_recorded_at is null
),

approved_cf as (
    select count(distinct customer_id) as the_value
    from {{ ref("int_credit_facilities") }}
    where
        approval_process_concluded_approved
        and completed_recorded_at is null
),

disbursed_cf as (
    select count(distinct customer_id) as the_value
    from {{ ref("int_cf_flatten") }}
    where
        disbursal_concluded_event_recorded_at_date_key != 19000101
        and completed_recorded_at is null
)


select
    1 as order_by,
    cast(the_value as numeric) as the_value,
    'Total Number of Customers' as the_name
from total_customers
union all
select
    2 as order_by,
    cast(the_value as numeric) as the_value,
    'Total Number of Active Customers' as the_name
from total_active_customers
union all
select
    3 as order_by,
    cast(the_value as numeric) as the_value,
    'Total Number of Customers with Approved Credit Facilities' as the_name
from approved_cf
union all
select
    4 as order_by,
    cast(the_value as numeric) as the_value,
    'Total Number of Customers with Disbursed Approved Credit Facilities' as the_name
from disbursed_cf

order by order_by
