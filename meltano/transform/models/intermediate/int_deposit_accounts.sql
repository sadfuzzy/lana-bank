select distinct
    id as deposit_account_id,
    account_holder_id as customer_id,
    created_at

from {{ ref('stg_deposit_accounts') }}
