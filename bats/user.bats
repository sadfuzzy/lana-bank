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
  [[ "$user" == "$username" ]] || exit 1;

  sats=$(graphql_output '.data.userCreate.user.unallocatedCollateral.btcBalance')
  [[ "$sats" == "0" ]] || exit 1;
}

@test "user: can topup unallocated collateral" {
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

  user_id=$(graphql_output '.data.userCreate.user.userId')
  sats=$(graphql_output '.data.userCreate.user.unallocatedCollateral.btcBalance')
  [[ "$sats" == "0" ]] || exit 1;

  variables=$(
    jq -n \
      --arg userId "$user_id" \
    '{
      input: {
        userId: $userId,
        amount: 100000,
      }
    }'
  )
  exec_graphql 'topup-unallocated-collateral' "$variables"
  sats=$(graphql_output '.data.userTopupCollateral.user.unallocatedCollateral.btcBalance')
  echo $(graphql_output)
  [[ "$sats" == "100000" ]] || exit 1;
}
