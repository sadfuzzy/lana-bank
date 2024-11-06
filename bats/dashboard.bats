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
  [[ "$new_pending_facilities" != "pending_facilities" ]] || exit 1
}
