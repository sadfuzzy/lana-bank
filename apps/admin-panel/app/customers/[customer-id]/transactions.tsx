"use client"
import { gql } from "@apollo/client"
import Link from "next/link"
import { FaExternalLinkAlt } from "react-icons/fa"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/primitive/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/primitive/table"
import Balance from "@/components/balance/balance"

import { useGetTransactionsForCustomerQuery } from "@/lib/graphql/generated"
import { formatDate } from "@/lib/utils"

gql`
  query GetTransactionsForCustomer($id: UUID!) {
    customer(id: $id) {
      customerId
      deposits {
        createdAt
        customerId
        depositId
        reference
        amount
      }
      withdrawals {
        status
        reference
        customerId
        createdAt
        withdrawalId
        amount
        customer {
          customerId
          email
        }
      }
      transactions @client {
        ... on Deposit {
          createdAt
          customerId
          depositId
          reference
          amount
        }
        ... on Withdrawal {
          status
          reference
          customerId
          withdrawalId
          createdAt
          amount
          customer {
            customerId
            email
          }
        }
      }
    }
  }
`

export const CustomerTransactionsTable = ({ customerId }: { customerId: string }) => {
  const { loading, error, data } = useGetTransactionsForCustomerQuery({
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
            <CardTitle>Transactions</CardTitle>
          </CardHeader>
          {!data ||
          !data.customer?.transactions ||
          data.customer.transactions.length === 0 ? (
            <CardContent>No transactions found for this customer</CardContent>
          ) : (
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>ID</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.customer.transactions.map((tx) => {
                    const isDeposit = "depositId" in tx
                    const id = isDeposit ? tx.depositId : tx.withdrawalId

                    return (
                      <TableRow key={id}>
                        <TableCell>{formatDate(tx.createdAt)}</TableCell>
                        <TableCell>{tx.__typename}</TableCell>
                        <TableCell>{id}</TableCell>
                        <TableCell>{tx.reference === id ? "" : tx.reference}</TableCell>
                        <TableCell className="text-right">
                          <Balance amount={tx.amount} currency={"usd"} />
                        </TableCell>
                        <TableCell>
                          {isDeposit ? "n/a" : tx.status.toLocaleLowerCase()}
                        </TableCell>
                        <TableCell>
                          <Link href={isDeposit ? `/deposits` : `/withdrawals/${id}`}>
                            <FaExternalLinkAlt className="text-primary" />
                          </Link>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          )}
        </>
      )}
    </Card>
  )
}
