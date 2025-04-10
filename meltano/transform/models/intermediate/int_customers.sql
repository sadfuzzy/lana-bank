select distinct
    json_value(parsed_event.id) as customer_id,
    json_value(parsed_event.email) as email,
    json_value(parsed_event.telegram_id) as telegram_id,
    json_value(parsed_event.customer_type) as customer_type,

    json_value(parsed_event.country) as country,
    json_value(parsed_event.ip_country) as ip_country

from {{ ref('stg_customer_events') }}

where event_type = "initialized"
