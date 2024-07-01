import { gql } from "@apollo/client"

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
