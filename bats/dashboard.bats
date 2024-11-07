#!/usr/bin/env bats

load "helpers"

setup_file() {
  start_server
}

teardown_file() {
  stop_server
}

@test "dashboard: counts facilities" {
  customer_id=$(create_customer)

  exec_admin_graphql 'dashboard'
  pending_facilities=$(graphql_output '.data.dashboard.pendingFacilities')
  [[ "$pending_facilities" != "null" ]] || exit 1

  facility=100000
  variables=$(
    jq -n \
    --arg customerId "$customer_id" \
    --argjson facility "$facility" \
    '{
      input: {
        customerId: $customerId,
        facility: $facility,
        terms: {
          annualRate: "12",
          accrualInterval: "END_OF_MONTH",
          incurrenceInterval: "END_OF_DAY",
          duration: { period: "MONTHS", units: 3 },
          liquidationCvl: "105",
          marginCallCvl: "125",
          initialCvl: "140"
        }
      }
    }'
  )

  exec_admin_graphql 'credit-facility-create' "$variables"
  credit_facility_id=$(graphql_output '.data.creditFacilityCreate.creditFacility.creditFacilityId')

  exec_admin_graphql 'dashboard'
  new_pending_facilities=$(graphql_output '.data.dashboard.pendingFacilities')
  [[ "$new_pending_facilities" != "$pending_facilities" ]] || exit 1

  active_facilities=$(graphql_output '.data.dashboard.activeFacilities')
  total_collateral=$(graphql_output '.data.dashboard.totalCollateral')
  [[ "$active_facilities" != "null" ]] || exit 1

  variables=$(
    jq -n \
      --arg credit_facility_id "$credit_facility_id" \
    '{
      input: {
        creditFacilityId: $credit_facility_id,
        collateral: 50000000,
      }
    }'

  )
  exec_admin_graphql 'credit-facility-collateral-update' "$variables"

  exec_admin_graphql 'dashboard'
  new_active_facilities=$(graphql_output '.data.dashboard.activeFacilities')
  [[ "$new_active_facilities" != "$active_facilities" ]] || exit 1
  new_total_collateral=$(graphql_output '.data.dashboard.totalCollateral')
  [[ "$new_total_collateral" != "$total_collateral" ]] || exit 1
  total_disbursed=$(graphql_output '.data.dashboard.totalDisbursed')

  amount=50000
  variables=$(
    jq -n \
      --arg creditFacilityId "$credit_facility_id" \
      --argjson amount "$amount" \
    '{
      input: {
        creditFacilityId: $creditFacilityId,
        amount: $amount,
      }
    }'
  )
  exec_admin_graphql 'credit-facility-disbursal-initiate' "$variables"
  disbursal_index=$(graphql_output '.data.creditFacilityDisbursalInitiate.disbursal.index')

    variables=$(
    jq -n \
      --arg creditFacilityId "$credit_facility_id" \
      --argjson disbursalIdx "$disbursal_index" \
    '{
      input: {
        creditFacilityId: $creditFacilityId,
        disbursalIdx: $disbursalIdx,
      }
    }'
  )
  exec_admin_graphql 'credit-facility-disbursal-confirm' "$variables"

  exec_admin_graphql 'dashboard'
  new_total_disbursed=$(graphql_output '.data.dashboard.totalDisbursed')
  [[ "$new_total_disbursed" != "$total_disbursed" ]] || exit 1
}
