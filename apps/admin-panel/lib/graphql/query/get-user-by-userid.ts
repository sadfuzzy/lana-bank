import { gql } from "@apollo/client"

import {
  GetUserByUserIdDocument,
  GetUserByUserIdQuery,
  GetUserByUserIdQueryVariables,
} from "../generated"

import { performQuery } from "."

gql`
  query getUserByUserId($id: UUID!) {
    user(id: $id) {
      userId
      email
      btcDepositAddress
      ustDepositAddress
      balance {
        unallocatedCollateral {
          settled {
            btcBalance
          }
        }
        checking {
          settled {
            usdBalance
          }
          pending {
            usdBalance
          }
        }
      }
    }
  }
`

export function getUserByUserId(
  variables: GetUserByUserIdQueryVariables,
): Promise<Error | GetUserByUserIdQuery> {
  return performQuery<GetUserByUserIdQuery, GetUserByUserIdQueryVariables>(
    GetUserByUserIdDocument,
    variables,
  )
}
