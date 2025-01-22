select
    cast(
        json_value(
            any_value(values having max recorded_at), "$.settled.cr_balance"
        ) as numeric
    ) as settled_cr,
    cast(
        json_value(
            any_value(values having max recorded_at), "$.settled.dr_balance"
        ) as numeric
    ) as settled_dr,
    json_value(values, "$.account_id") as account_id,
    json_value(values, "$.currency") as currency

from {{ ref('stg_account_balances') }}

group by account_id, currency
