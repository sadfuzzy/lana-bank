import { gql } from "@apollo/client"

import { UserDepositDocument, UserDepositInput, UserDepositMutation } from "../generated"

import { performMutation } from "."

gql`
  mutation UserDeposit($input: UserDepositInput!) {
    userDeposit(input: $input) {
      user {
        balance {
          unallocatedCollateral {
            settled {
              btcBalance
            }
          }
          checking {
            pending {
              usdBalance
            }
            settled {
              usdBalance
            }
          }
        }
        bitfinexUsername
        userId
      }
    }
  }
`

export function userDeposit(
  variables: UserDepositInput,
): Promise<Error | UserDepositMutation> {
  return performMutation<UserDepositMutation, UserDepositInput>(
    UserDepositDocument,
    variables,
  )
}
