import { gql } from "@apollo/client"

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
