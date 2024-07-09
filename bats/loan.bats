#!/usr/bin/env bats

load "helpers"

setup_file() {
  start_server
}

teardown_file() {
  stop_server
}

wait_till_loan_collateralized() {
  exec_graphql 'alice' 'me'
  usd_balance=$(graphql_output '.data.me.balance.checking.settled.usdBalance')
  cache_value 'usd_balance' "$usd_balance"
  unallocated_collateral_sats=$(graphql_output '.data.me.balance.unallocatedCollateral.settled.btcBalance')
  cache_value 'unallocated_collateral_sats' "$unallocated_collateral_sats"
  [[ "$usd_balance" == "10000" && "$unallocated_collateral_sats" == "999766666" ]] || return 1
}

loan_balance() {
    variables=$(
    jq -n \
    --arg loanId "$1" \
    '{ id: $loanId }'
  )
  exec_graphql 'alice' 'find-loan' "$variables"
  outstanding_balance=$(graphql_output '.data.loan.balance.outstanding.usdBalance')
  cache_value 'outstanding' "$outstanding_balance"
  collateral_balance_sats=$(graphql_output '.data.loan.balance.collateral.btcBalance')
  cache_value 'collateral_sats' "$collateral_balance_sats"
}

@test "loan: loan lifecycle" {

  exec_admin_graphql 'current-terms-update' 
  terms_id=$(graphql_output '.data.currentTermsUpdate.terms.termsId')
  [[ "$terms_id" != "null" ]] || exit 1

  username=$(random_uuid)
  token=$(create_user)
  cache_value "alice" "$token"

  exec_graphql 'alice' 'me'
  user_id=$(graphql_output '.data.me.userId')
  btc_address=$(graphql_output '.data.me.btcDepositAddress')
  ust_address=$(graphql_output '.data.me.ustDepositAddress')

  variables=$(
    jq -n \
      --arg address "$btc_address" \
    '{
       address: $address,
       amount: "10",
       currency: "BTC"
    }'
  )
  exec_cala_graphql 'simulate-deposit' "$variables"

  variables=$(
    jq -n \
    --arg userId "$user_id" \
    '{
      input: {
        userId: $userId,
        desiredPrincipal: 10000
      }
    }'
  )

  exec_admin_graphql 'loan-create' "$variables"
  loan_id=$(graphql_output '.data.loanCreate.loan.loanId')
  [[ "$loan_id" != "null" ]] || exit 1

  retry 30 1 wait_till_loan_collateralized

  loan_balance "$loan_id"
  outstanding_before=$(read_value "outstanding")
  [[ "$outstanding_before" == "10000" ]] || exit 1
  collateral_sats=$(read_value 'collateral_sats')
  [[ "$collateral_sats" == "233334" ]] || exit 1

  variables=$(
    jq -n \
      --arg loanId "$loan_id" \
    '{
      input: {
        loanId: $loanId,
        amount: 10000,
      }
    }'
  )
  exec_admin_graphql 'loan-partial-payment' "$variables"

  loan_balance "$loan_id"
  outstanding_after=$(read_value "outstanding")
  [[ "$outstanding_after" == "0" ]] || exit 1
  collateral_sats=$(read_value 'collateral_sats')
  [[ "$collateral_sats" == "0" ]] || exit 1

}
