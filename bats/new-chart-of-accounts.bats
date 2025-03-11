#!/usr/bin/env bats

load "helpers"

PERSISTED_LOG_FILE="chart-of-accounts.e2e-logs"
RUN_LOG_FILE="chart-of-accounts.run.e2e-logs"

setup_file() {
  start_server
  login_superadmin
}

teardown_file() {
  stop_server
  cp "$LOG_FILE" "$PERSISTED_LOG_FILE"
}

@test "chart-of-accounts: can import CSV file" {
exec_admin_graphql 'new-chart-of-accounts'
  chart_id=$(graphql_output '.data.newChartOfAccounts.chartId')

  temp_file=$(mktemp)
  echo "
    $((RANDOM % 100)),,,Assets ,,
    ,,,,,
    $((RANDOM % 100)),,,Assets,,
    ,,,,,
    ,$((RANDOM % 100)),,Effective,,
    ,,$((RANDOM % 1000)),Central Office,
  " > "$temp_file"

  variables=$(
    jq -n \
    --arg chart_id "$chart_id" \
    '{
      input: {
        chartId: $chart_id,
        file: null
      }
    }'
  )

  response=$(exec_admin_graphql_upload 'chart-of-accounts-csv-import' "$variables" "$temp_file" "input.file")
  success=$(echo "$response" | jq -r '.data.chartOfAccountsCsvImport.success')
  [[ "$success" == "true" ]] || exit 1
}
