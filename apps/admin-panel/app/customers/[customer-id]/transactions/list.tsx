"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table"
import { Button } from "@/ui/button"
import Balance from "@/components/balance/balance"

import { GetCustomerTransactionsQuery } from "@/lib/graphql/generated"
import { formatDate } from "@/lib/utils"
import { WithdrawalStatusBadge } from "@/app/withdrawals/status-badge"

type Transaction =
  | NonNullable<GetCustomerTransactionsQuery["customer"]>["deposits"][number]
  | NonNullable<GetCustomerTransactionsQuery["customer"]>["withdrawals"][number]

type CustomerTransactionsTableProps = {
  transactions: Transaction[]
}

// TODO use data-table
export const CustomerTransactionsTable: React.FC<CustomerTransactionsTableProps> = ({
  transactions,
}) => {
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
          <div className="overflow-x-auto border rounded-md">
            <Table className="table-fixed w-full">
              <TableHeader className="bg-secondary [&_tr:hover]:!bg-secondary">
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-24"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx) => {
                  const isDeposit = "depositId" in tx
                  const id = isDeposit ? tx.depositId : tx.withdrawalId

                  return (
                    <TableRow key={id}>
                      <TableCell>
                        {formatDate(tx.createdAt, { includeTime: false })}
                      </TableCell>
                      <TableCell>{tx.__typename}</TableCell>
                      <TableCell>
                        <Balance amount={tx.amount} currency={"usd"} />
                      </TableCell>
                      <TableCell>
                        {isDeposit ? "N/A" : <WithdrawalStatusBadge status={tx.status} />}
                      </TableCell>
                      <TableCell>
                        {isDeposit ? (
                          <div className="h-9" />
                        ) : (
                          <Link href={`/withdrawals/${id}`}>
                            <Button
                              variant="outline"
                              className="w-full flex items-center justify-between"
                            >
                              View
                              <ArrowRight className="h-4 w-4" />
                            </Button>
                          </Link>
                        )}
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
