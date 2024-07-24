import { gql } from "@apollo/client"

gql`
  query Customers($first: Int!, $after: String) {
    customers(first: $first, after: $after) {
      nodes {
        customerId
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
