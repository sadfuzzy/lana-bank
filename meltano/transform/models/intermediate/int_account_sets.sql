select
    id as account_set_id,
    set_name,
    row_number() over () as set_key

from {{ ref('stg_account_sets') }}
