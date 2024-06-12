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

  sats=$(graphql_output '.data.userCreate.user.balance.unallocatedCollateral.settled.btcBalance')
  [[ "$sats" == "0" ]] || exit 1;

  user_id=$(graphql_output '.data.userCreate.user.userId')
  cache_value 'user.id' "$user_id"

  btc_address=$(graphql_output '.data.userCreate.user.btcDepositAddress')
  cache_value 'user.btc' "$btc_address"

  ust_address=$(graphql_output '.data.userCreate.user.ustDepositAddress')
  cache_value 'user.ust' "$ust_address"
}

@test "user: can deposit" {
  user_id=$(read_value 'user.id')
  ust_address=$(read_value 'user.ust')

  variables=$(
    jq -n \
      --arg address "$ust_address" \
    '{
       address: $address,
       amount: "10000",
       currency: "UST"
    }'
  )
  exec_cala_graphql 'simulate-deposit' "$variables"

  variables=$(
    jq -n \
    --arg userId "$user_id" \
    '{ id: $userId }'
  )
  exec_graphql 'find-user' "$variables"
  usd_balance=$(graphql_output '.data.user.balance.checking.settled.usdBalance')
  [[ "$usd_balance" == 1000000 ]] || exit 1
}

@test "user: can withdraw" {
  user_id=$(read_value 'user.id')

  variables=$(
    jq -n \
      --arg userId "$user_id" \
    '{
      input: {
        userId: $userId,
        amount: 150000,
        destination: "tron-address",
        reference: ("initiate_withdrawal-" + $userId)
      }
    }'
  )
  exec_graphql 'initiate-withdrawal' "$variables"
  withdrawal_id=$(graphql_output '.data.withdrawalInitiate.withdrawal.withdrawalId')
  [[ "$withdrawal_id" != "null" ]] || exit 1

  variables=$(
    jq -n \
    --arg userId "$user_id" \
    '{ id: $userId }'
  )
  exec_graphql 'find-user' "$variables"
  checking_balance=$(graphql_output '.data.user.balance.checking.settled.usdBalance')
  echo $(graphql_output)
  [[ "$checking_balance" == 850000 ]] || exit 1
  encumbered_checking_balance=$(graphql_output '.data.user.balance.checking.pending.usdBalance')
  [[ "$encumbered_checking_balance" == 150000 ]] || exit 1
}
