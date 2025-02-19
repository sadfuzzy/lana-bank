select
    credit_facility_id,
    day,
    terms_initial_cvl,
    terms_liquidation_cvl,
    terms_margin_call_cvl,
    total_collateral_value_usd,
    facility_usd,
    total_disbursed_usd

from {{ ref('daily_credit_facility_states') }}
left join {{ ref('credit_facilities') }} using (credit_facility_id)

where
    total_disbursed_usd > 0
    and total_collateral_value_usd < facility_usd * terms_liquidation_cvl
