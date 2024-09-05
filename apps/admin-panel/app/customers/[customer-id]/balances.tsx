"use client"
import { gql } from "@apollo/client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/primitive/card"
import Balance from "@/components/balance/balance"

import { useGetCustomerBalancesQuery } from "@/lib/graphql/generated"
import { DetailItem } from "@/components/details"

gql`
  query GetCustomerBalances($id: UUID!) {
    customer(id: $id) {
      customerId
      balance {
        checking {
          settled
          pending
        }
      }
    }
  }
`

export const CustomerAccountBalances = ({ customerId }: { customerId: string }) => {
  const { loading, error, data } = useGetCustomerBalancesQuery({
    variables: {
      id: customerId,
    },
  })

  return (
    <Card className="mt-4">
      {loading ? (
        <CardContent className="p-6">Loading...</CardContent>
      ) : error ? (
        <CardContent className="p-6 text-destructive">{error.message}</CardContent>
      ) : (
        <>
          <CardHeader>
            <CardTitle>Account Balances</CardTitle>
          </CardHeader>
          <CardContent>
            <DetailItem
              label="Checking Settled Balance (USD)"
              valueComponent={
                <Balance
                  amount={data?.customer?.balance.checking.settled}
                  currency="usd"
                />
              }
            />
            <DetailItem
              label="Pending Withdrawals (USD)"
              valueComponent={
                <Balance
                  amount={data?.customer?.balance.checking.pending}
                  currency="usd"
                />
              }
            />
          </CardContent>
        </>
      )}
    </Card>
  )
}
