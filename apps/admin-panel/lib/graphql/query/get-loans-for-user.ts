import { gql } from "@apollo/client"

gql`
  query GetLoansForCustomer($id: UUID!) {
    customer(id: $id) {
      customerId
      loans {
        id
        loanId
        createdAt
        status
        loanTerms {
          annualRate
          interval
          liquidationCvl
          marginCallCvl
          initialCvl
          duration {
            period
            units
          }
        }
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
