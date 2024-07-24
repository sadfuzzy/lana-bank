import { gql } from "@apollo/client"

gql`
  query getCustomerByCustomerId($id: UUID!) {
    customer(id: $id) {
      customerId
      email
      status
      level
      applicantId
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
