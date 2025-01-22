with ordered as (

    select
        id,
        code,
        name,
        normal_balance_type,
        latest_values,
        created_at,
        row_number()
            over (
                partition by id
                order by _sdc_received_at desc
            )
            as order_received_desc

    from {{ source("lana", "public_cala_accounts_view") }}

)

select * except (order_received_desc)

from ordered

where order_received_desc = 1
