import { gql } from "@apollo/client"

import { UsersDocument, UsersQuery, UsersQueryVariables } from "../generated"

import { performQuery } from "."

gql`
  query Users($first: Int!, $after: String) {
    users(first: $first, after: $after) {
      nodes {
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
      pageInfo {
        endCursor
        startCursor
        hasNextPage
        hasPreviousPage
      }
    }
  }
`

export async function getUsers(
  variables: UsersQueryVariables,
): Promise<UsersQuery | Error> {
  return performQuery<UsersQuery, UsersQueryVariables>(UsersDocument, variables)
}
