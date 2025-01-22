with ordered as (

    select
        journal_id,
        account_id,
        currency,
        recorded_at,
        values,
        row_number()
            over (
                partition by account_id
                order by _sdc_received_at desc
            )
            as order_received_desc

    from {{ source("lana", "public_cala_balance_history_view") }}

)

select * except (order_received_desc)

from ordered

where order_received_desc = 1
