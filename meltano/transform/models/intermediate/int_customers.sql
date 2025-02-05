select distinct
    json_value(event, "$.id") as customer_id,
    row_number() over () as customer_key,
    json_value(event, "$.email") as email,
    json_value(event, "$.account_ids.on_balance_sheet_deposit_account_id")
        as on_balance_sheet_deposit_account_id

from {{ ref('stg_customer_events') }}

where event_type = "initialized"
