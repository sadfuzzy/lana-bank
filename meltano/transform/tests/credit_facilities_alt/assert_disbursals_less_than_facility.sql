select
    day,
    credit_facility_id,
    total_disbursed_usd,
    facility_usd

from {{ ref('daily_credit_facility_states') }}
left join {{ ref('credit_facilities') }} using (credit_facility_id)

where total_disbursed_usd > facility_usd
