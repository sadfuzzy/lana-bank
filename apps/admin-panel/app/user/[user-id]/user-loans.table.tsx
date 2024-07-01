"use client"

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

export const UserLoansTable = ({ userId }: { userId: string }) => {
  const {
    loading,
    error,
    data: userLoans,
  } = useGetLoansForUserQuery({
    variables: {
      id: userId,
    },
  })

  return (
    <Card className="mt-4">
      {loading ? (
        <CardContent className="p-6">Loading...</CardContent>
      ) : error ? (
        <CardContent className="p-6">{error.message}</CardContent>
      ) : !userLoans || !userLoans.user?.loans || userLoans.user?.loans.length === 0 ? (
        <CardContent className="p-6">No loans found for this user</CardContent>
      ) : (
        <>
          <CardHeader>
            <CardTitle>User loans</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell>Loan ID</TableCell>
                  <TableCell>Collateral (BTC)</TableCell>
                  <TableCell>Interest Incurred (USD)</TableCell>
                  <TableCell>Outstanding (USD)</TableCell>
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
