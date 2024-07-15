"use client"

import { IoEllipsisHorizontal } from "react-icons/io5"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/primitive/card"
import { currencyConverter, formatCurrency } from "@/lib/utils"

import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/primitive/table"
import { useGetLoansForUserQuery } from "@/lib/graphql/generated"
import { Button } from "@/components/primitive/button"
import { CreateLoanDialog } from "@/components/loan/create-loan-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/primitive/dropdown-menu"
import { LoanPartialPaymentDialog } from "@/components/loan/loan-partial-payment"

export const UserLoansTable = ({ userId }: { userId: string }) => {
  const {
    loading,
    error,
    data: userLoans,
    refetch,
  } = useGetLoansForUserQuery({
    variables: {
      id: userId,
    },
  })

  return (
    <Card className="mt-4">
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle>User loans</CardTitle>
        <CreateLoanDialog refetch={refetch} userId={userId}>
          <Button>New Loan</Button>
        </CreateLoanDialog>
      </CardHeader>
      {loading ? (
        <CardContent className="p-6">Loading...</CardContent>
      ) : error ? (
        <CardContent className="p-6">{error.message}</CardContent>
      ) : !userLoans || !userLoans.user?.loans || userLoans.user?.loans.length === 0 ? (
        <CardContent className="p-6">No loans found for this user</CardContent>
      ) : (
        <>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell>Loan ID</TableCell>
                  <TableCell>Collateral (BTC)</TableCell>
                  <TableCell>Interest Incurred (USD)</TableCell>
                  <TableCell>Outstanding (USD)</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userLoans.user.loans.map((loan) => (
                  <TableRow key={loan.loanId}>
                    <TableCell>{loan.loanId}</TableCell>
                    <TableCell>{loan.balance.collateral.btcBalance} sats</TableCell>
                    <TableCell>
                      {formatCurrency({
                        amount: currencyConverter.centsToUsd(
                          loan.balance.interestIncurred.usdBalance,
                        ),
                        currency: "USD",
                      })}
                    </TableCell>
                    <TableCell>
                      {formatCurrency({
                        amount: currencyConverter.centsToUsd(
                          loan.balance.outstanding.usdBalance,
                        ),
                        currency: "USD",
                      })}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <Button variant="ghost">
                            <IoEllipsisHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="text-sm">
                          <DropdownMenuItem onClick={(e) => e.preventDefault()}>
                            <LoanPartialPaymentDialog
                              refetch={refetch}
                              loanId={loan.loanId}
                            >
                              <span>Loan Partial Payment</span>
                            </LoanPartialPaymentDialog>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </>
      )}
    </Card>
  )
}
