import Link from "next/link"

import { IoDownloadOutline } from "react-icons/io5"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/primitive/card"
import { Button } from "@/components/primitive/button"
import { getMyLoans } from "@/lib/graphql/query/get-my-loans"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/primitive/table"
import { Alert } from "@/components/primitive/alert"
import { currencyConverter, formatCurrency, formatDate } from "@/lib/utils"

export const LoanCard = async () => {
  const getMyLoansResponse = await getMyLoans()

  if (getMyLoansResponse instanceof Error) {
    return (
      <Card className="w-2/3">
        <CardHeader>
          <CardTitle>ERROR!</CardTitle>
          <CardDescription>Something went wrong</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">{getMyLoansResponse.message}</Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-2/3">
      <CardHeader>
        <CardTitle className="flex justify-between align-middle items-center">
          Loans
          <Link href="/loan/create">
            <Button>New Loan</Button>
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {getMyLoansResponse.me?.loans.length &&
        getMyLoansResponse.me?.loans.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Loan Details</TableHead>
                <TableHead>Collateral</TableHead>
                <TableHead>Interest Incurred</TableHead>
                <TableHead>Outstanding</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {getMyLoansResponse.me?.loans.map((loan) => (
                <TableRow key={loan.id}>
                  <TableCell>
                    <Link
                      className="flex flex-col gap-1 mt-1"
                      href={`/loan/${loan.loanId}`}
                    >
                      <p>{formatDate(loan.startDate)}</p>
                      <p className="text-xs text-primary">{loan.loanId}</p>
                    </Link>
                  </TableCell>
                  <TableCell>
                    {formatCurrency({
                      amount: loan.balance.collateral.btcBalance,
                      currency: "SATS",
                    })}
                  </TableCell>
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
        ) : (
          <Card variant="secondary">
            <CardHeader className="flex">
              <div className="flex align-middle gap-4">
                <IoDownloadOutline className="w-10 h-10 text-primary" />
                <div className="flex flex-col gap-2">
                  <CardTitle>Add funds to start a loan</CardTitle>
                  <CardDescription>
                    Curious how much to deposit? Explore loan options and rates
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        )}
      </CardContent>
    </Card>
  )
}
