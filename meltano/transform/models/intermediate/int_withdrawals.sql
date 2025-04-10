select distinct
    id as withdrawal_id,
    deposit_account_id,
    approval_process_id,
    cancelled_tx_id,
    reference
{# created_at #}

from {{ ref('stg_withdrawals') }}
