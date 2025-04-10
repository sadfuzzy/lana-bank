with

initialized as (
    select
        withdrawal_id,
        amount,
        deposit_account_id,
        approval_process_id
    from {{ ref('int_withdrawal_events') }}
    where event_type = 'initialized'

)
,

was_approved as (
    select
        withdrawal_id,
        approved,
        approval_process_id,
        recorded_at
    from {{ ref('int_withdrawal_events') }}
    where event_type = 'approval_process_concluded'

),

approved_withdrawals as (
    select
        i.withdrawal_id,
        i.amount,
        i.deposit_account_id,
        a.recorded_at
    from was_approved as a
    left join initialized as i using (withdrawal_id, approval_process_id)
    where approved

)

select *
from approved_withdrawals
