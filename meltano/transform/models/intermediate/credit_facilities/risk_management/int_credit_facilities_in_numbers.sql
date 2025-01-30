with approved as (
    select count(distinct event_id) as the_value
    from {{ ref("int_credit_facilities") }}
    where approval_process_concluded_approved
),

total as (
    select count(distinct event_id) as the_value
    from {{ ref("int_credit_facilities") }}
)


select
    1 as order_by,
    cast(the_value as string) as the_value,
    'Number of Approved Credit Facilities' as the_name
from approved
union all
select
    2 as order_by,
    cast(the_value as string) as the_value,
    'Number of Total Credit Facilities' as the_name
from total
union all
select
    3 as order_by,
    cast(a.the_value / t.the_value as string) as the_value,
    'Approved Rate' as the_name
from approved as a, total as t

order by order_by
