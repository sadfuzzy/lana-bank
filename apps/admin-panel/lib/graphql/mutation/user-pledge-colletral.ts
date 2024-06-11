import { gql } from "@apollo/client"

import {
  UserPledgeCollateralDocument,
  UserPledgeCollateralInput,
  UserPledgeCollateralMutation,
} from "../generated"

import { performMutation } from "."

gql`
  mutation UserPledgeCollateral($input: UserPledgeCollateralInput!) {
    userPledgeCollateral(input: $input) {
      user {
        balance {
          checking {
            settled {
              usdBalance
            }
            pending {
              usdBalance
            }
          }
          unallocatedCollateral {
            settled {
              btcBalance
            }
          }
        }
        bitfinexUsername
        userId
      }
    }
  }
`

export function userPledgeCollateral(
  variables: UserPledgeCollateralInput,
): Promise<Error | UserPledgeCollateralMutation> {
  return performMutation<UserPledgeCollateralMutation, UserPledgeCollateralInput>(
    UserPledgeCollateralDocument,
    variables,
  )
}
