import { gql } from "@apollo/client"

gql`
  query GetLoansForUser($id: UUID!) {
    user(id: $id) {
      userId
      loans {
        loanId
        balance {
          collateral {
            btcBalance
          }
          outstanding {
            usdBalance
          }
          interestIncurred {
            usdBalance
          }
        }
      }
    }
  }
`
