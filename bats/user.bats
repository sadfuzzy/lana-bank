#!/usr/bin/env bats

load "helpers"

setup_file() {
  start_server
}

teardown_file() {
  stop_server
}

@test "user: can create a user" {
  username=$(random_uuid)
  variables=$(
    jq -n \
      --arg username "$username" \
    '{
      input: {
        bitfinexUsername: $username,
      }
    }'
  )
  exec_graphql 'user-create' "$variables"
  user=$(graphql_output '.data.userCreate.user.bitfinexUsername')
  echo $(graphql_output)
  echo $user
  [[ "$user" == "$username" ]] || exit 1;

  sats=$(graphql_output '.data.userCreate.user.unallocatedCollateral.btcBalance')
  [[ "$sats" == "0" ]] || exit 1;
}
