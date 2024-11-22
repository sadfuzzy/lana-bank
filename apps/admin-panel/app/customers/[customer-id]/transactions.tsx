"use client"

import { useRouter } from "next/navigation"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table"
import Balance from "@/components/balance/balance"

import { GetCustomerQuery } from "@/lib/graphql/generated"
import { formatDate } from "@/lib/utils"
import { WithdrawalStatusBadge } from "@/app/withdrawals/status-badge"

type CustomerTransactionsTableProps = {
  transactions: NonNullable<GetCustomerQuery["customer"]>["transactions"]
}

// TODO use data-table
export const CustomerTransactionsTable: React.FC<CustomerTransactionsTableProps> = ({
  transactions,
}) => {
  const router = useRouter()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transactions</CardTitle>
        <CardDescription>Transactions for this Customer</CardDescription>
      </CardHeader>
      {transactions.length === 0 ? (
        <CardContent className="text-sm">No data to display</CardContent>
      ) : (
        <CardContent>
          <div className="overflow-x-auto border  rounded-md">
            <Table className="table-fixed w-full">
              <TableHeader className="bg-secondary [&_tr:hover]:!bg-secondary">
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx) => {
                  const isDeposit = "depositId" in tx
                  const id = isDeposit ? tx.depositId : tx.withdrawalId

                  return (
                    <TableRow
                      key={id}
                      className={isDeposit ? "" : "cursor-pointer"}
                      onClick={() => {
                        if (isDeposit) {
                          return
                        } else {
                          router.push(`/withdrawals/${id}`)
                        }
                      }}
                    >
                      <TableCell>{formatDate(tx.createdAt)}</TableCell>
                      <TableCell>{tx.__typename}</TableCell>
                      <TableCell>
                        <Balance amount={tx.amount} currency={"usd"} />
                      </TableCell>
                      <TableCell>
                        {isDeposit ? "N/A" : <WithdrawalStatusBadge status={tx.status} />}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
