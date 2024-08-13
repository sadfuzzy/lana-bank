"use client"
import { gql } from "@apollo/client"

import { useState } from "react"

import { IoEllipsisHorizontal } from "react-icons/io5"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/primitive/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/primitive/table"
import { useGetWithdrawalsForCustomerQuery } from "@/lib/graphql/generated"
import { Button } from "@/components/primitive/button"
import WithdrawalInitiateDialog from "@/components/customer/withdrawal-initiate-dialog"
import { WithdrawalConfirmDialog } from "@/components/customer/withdrawal-confirm-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/primitive/dropdown-menu"
import { Badge } from "@/components/primitive/badge"
import { currencyConverter, formatCurrency } from "@/lib/utils"

gql`
  query GetWithdrawalsForCustomer($id: UUID!) {
    customer(id: $id) {
      customerId
      withdrawals {
        confirmed
        customerId
        withdrawalId
        amount
      }
    }
  }
`

export const CustomerWithdrawalsTable = ({ customerId }: { customerId: string }) => {
  const [openWithdrawalInitiateDialog, setOpenWithdrawalInitiateDialog] = useState(false)
  const [openWithdrawalConfirmDialog, setOpenWithdrawalConfirmDialog] = useState<
    string | null
  >(null)

  const { loading, error, data, refetch } = useGetWithdrawalsForCustomerQuery({
    variables: {
      id: customerId,
    },
  })

  return (
    <>
      <WithdrawalInitiateDialog
        refetch={refetch}
        customerId={customerId}
        openWithdrawalInitiateDialog={openWithdrawalInitiateDialog}
        setOpenWithdrawalInitiateDialog={setOpenWithdrawalInitiateDialog}
      />
      {openWithdrawalConfirmDialog && (
        <WithdrawalConfirmDialog
          withdrawalId={openWithdrawalConfirmDialog}
          openWithdrawalConfirmDialog={Boolean(openWithdrawalConfirmDialog)}
          setOpenWithdrawalConfirmDialog={() => setOpenWithdrawalConfirmDialog(null)}
          refetch={refetch}
        />
      )}
      <Card className="mt-4">
        {loading ? (
          <CardContent className="p-6">Loading...</CardContent>
        ) : error ? (
          <CardContent className="p-6 text-destructive">{error.message}</CardContent>
        ) : (
          <>
            <CardHeader className="flex flex-row justify-between align-middle items-center pb-0">
              <div className="flex flex-col space-y-1.5">
                <CardTitle>Withdrawals</CardTitle>
                <CardDescription>Withdrawal Details for Customer</CardDescription>
              </div>
              <Button onClick={() => setOpenWithdrawalInitiateDialog(true)}>
                New Withdrawal
              </Button>
            </CardHeader>
            {!data ||
            !data.customer?.withdrawals ||
            data.customer.withdrawals.length === 0 ? (
              <CardContent className="p-6">
                No withdrawals found for this customer
              </CardContent>
            ) : (
              <CardContent className="mt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Withdrawal ID</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Confirmed</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.customer.withdrawals.map((withdrawal) => (
                      <>
                        <TableRow key={withdrawal.withdrawalId}>
                          <TableCell>{withdrawal.withdrawalId}</TableCell>
                          <TableCell>
                            {formatCurrency({
                              amount: currencyConverter.centsToUsd(withdrawal.amount),
                              currency: "USD",
                            })}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={withdrawal.confirmed ? "success" : "destructive"}
                            >
                              {withdrawal.confirmed ? "True" : "False"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger>
                                <Button variant="ghost">
                                  <IoEllipsisHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent className="text-sm">
                                <DropdownMenuItem
                                  onClick={() => {
                                    if (!withdrawal.confirmed)
                                      setOpenWithdrawalConfirmDialog(
                                        withdrawal.withdrawalId,
                                      )
                                  }}
                                >
                                  Confirm Withdraw
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      </>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            )}
          </>
        )}
      </Card>
    </>
  )
}
