with collateral_updated as (

    select
        id as event_id,
        cast(format_date('%Y%m%d', recorded_at) as int64)
            as recorded_at_date_key,
        recorded_at,
        event_type,
        cast(
            format_date(
                '%Y%m%d',
                parse_timestamp(
                    '%Y-%m-%dT%H:%M:%E*SZ',
                    json_value(event, '$.recorded_in_ledger_at'),
                    'UTC'
                )
            ) as int64
        ) as recorded_in_ledger_at_date_key,
        cast(json_value(event, '$.audit_info.audit_entry_id') as integer)
            as audit_entry_id,
        cast(json_value(event, '$.abs_diff') as numeric) as abs_diff,
        cast(json_value(event, '$.total_collateral') as numeric)
            as total_collateral,
        parse_timestamp(
            '%Y-%m-%dT%H:%M:%E*SZ',
            json_value(event, '$.recorded_in_ledger_at'),
            'UTC'
        ) as recorded_in_ledger_at,
        json_value(event, '$.action') as action
    from {{ ref('stg_credit_facility_events') }} as cfe
    where
        cfe.event_type = 'collateral_updated'
        and json_value(event, '$.tx_id') is not null

),

collateralization_changed as (

    select
        id as event_id,
        cast(format_date('%Y%m%d', recorded_at) as int64)
            as recorded_at_date_key,
        recorded_at,
        cast(
            format_date(
                '%Y%m%d',
                parse_timestamp(
                    '%Y-%m-%dT%H:%M:%E*SZ',
                    json_value(event, '$.recorded_at'),
                    'UTC'
                )
            ) as int64
        ) as event_recorded_at_date_key,
        cast(json_value(event, '$.audit_info.audit_entry_id') as integer)
            as audit_entry_id,
        cast(json_value(event, '$.collateral') as numeric) as collateral,
        cast(json_value(event, '$.price') as numeric) as price,
        cast(json_value(event, '$.outstanding.disbursed') as numeric)
            as outstanding_disbursed,
        cast(json_value(event, '$.outstanding.interest') as numeric)
            as outstanding_interest,
        parse_timestamp(
            '%Y-%m-%dT%H:%M:%E*SZ', json_value(event, '$.recorded_at'), 'UTC'
        ) as event_recorded_at,
        json_value(event, '$.state') as state
    from {{ ref('stg_credit_facility_events') }} as cfe
    where cfe.event_type = 'collateralization_changed'

)


select
    cu.* except (abs_diff, total_collateral),

    cc.event_recorded_at as collateralization_changed_event_recorded_at,
    state as collateralization_changed_state,
    cu.total_collateral,

    cc.price,
    coalesce(cc.event_recorded_at_date_key, 19000101)
        as collateralization_changed_event_recorded_at_date_key,

    case
        when lower(action) = 'add' then cu.abs_diff else
            safe_negate(cu.abs_diff)
    end as diff,
    coalesce(cc.collateral, 0) as collateral,
    coalesce(cc.outstanding_disbursed, 0) as outstanding_disbursed,
    coalesce(cc.outstanding_interest, 0) as outstanding_interest
from collateral_updated as cu
left join
    collateralization_changed as cc
    on cu.event_id = cc.event_id and cu.audit_entry_id = cc.audit_entry_id
