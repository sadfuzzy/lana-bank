"use client"

import { IoEllipsisHorizontal } from "react-icons/io5"
import { IoMdArrowDropdown, IoMdArrowDropup } from "react-icons/io"
import Link from "next/link"
import { useState } from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/primitive/card"
import { currencyConverter, formatCurrency } from "@/lib/utils"
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/primitive/table"
import { Loan, LoanStatus, useGetLoansForUserQuery } from "@/lib/graphql/generated"
import { Button } from "@/components/primitive/button"
import { CreateLoanDialog } from "@/components/loan/create-loan-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/primitive/dropdown-menu"
import { LoanPartialPaymentDialog } from "@/components/loan/loan-partial-payment"
import { LoanApproveDialog } from "@/components/loan/approve-loan"
import { LoanBadge } from "@/components/loan/loan-badge"
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/primitive/collapsible"
import { DetailItem } from "@/components/details"
import { formatInterval, formatPeriod } from "@/lib/terms/utils"

type LoanRowProps = {
  loanId: string
  balance: {
    collateral: {
      btcBalance: number
    }
    interestIncurred: {
      usdBalance: number
    }
    outstanding: {
      usdBalance: number
    }
  }
  status: LoanStatus
  loanTerms: Loan["loanTerms"]
}

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
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell>Loan ID</TableCell>
                <TableCell>Collateral (BTC)</TableCell>
                <TableCell>Interest Incurred (USD)</TableCell>
                <TableCell>Outstanding (USD)</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userLoans.user.loans.map((loan) => (
                <LoanRow key={loan.loanId} loan={loan} refetch={refetch} />
              ))}
            </TableBody>
          </Table>
        </CardContent>
      )}
    </Card>
  )
}

const LoanRow = ({ loan, refetch }: { loan: LoanRowProps; refetch: () => void }) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Collapsible asChild>
      <>
        <CollapsibleTrigger asChild>
          <TableRow onClick={() => setIsOpen(!isOpen)}>
            <TableCell>
              <div className="flex items-center gap-2">
                {loan.loanId}
                <Button
                  variant="ghost"
                  className="p-2"
                  onClick={() => setIsOpen(!isOpen)}
                >
                  {isOpen ? (
                    <IoMdArrowDropup className="w-5 h-5" />
                  ) : (
                    <IoMdArrowDropdown className="w-5 h-5" />
                  )}
                </Button>
              </div>
            </TableCell>
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
                amount: currencyConverter.centsToUsd(loan.balance.outstanding.usdBalance),
                currency: "USD",
              })}
            </TableCell>
            <TableCell>
              <LoanBadge status={loan.status} />
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
                    <Link href={`/loan?loanId=${loan.loanId}`}>
                      <span>View Details</span>
                    </Link>
                  </DropdownMenuItem>
                  {loan.status === LoanStatus.Active && (
                    <DropdownMenuItem onClick={(e) => e.preventDefault()}>
                      <LoanPartialPaymentDialog refetch={refetch} loanId={loan.loanId}>
                        <span>Loan Partial Payment</span>
                      </LoanPartialPaymentDialog>
                    </DropdownMenuItem>
                  )}
                  {loan.status === LoanStatus.New && (
                    <DropdownMenuItem onClick={(e) => e.preventDefault()}>
                      <LoanApproveDialog refetch={refetch} loanId={loan.loanId}>
                        <span>Approve Loan</span>
                      </LoanApproveDialog>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        </CollapsibleTrigger>
        <TableCell colSpan={6} className="p-0">
          <CollapsibleContent asChild>
            <LoanTermsCollapsible loanTerms={loan.loanTerms} />
          </CollapsibleContent>
        </TableCell>
      </>
    </Collapsible>
  )
}

const LoanTermsCollapsible = ({ loanTerms }: { loanTerms: Loan["loanTerms"] }) => {
  return (
    <div className="p-4 w-full bg-secondary-foreground">
      <div className="grid grid-cols-2 gap-4">
        <div className="grid ">
          <DetailItem
            label="Duration"
            value={
              String(loanTerms.duration.units) +
              " " +
              formatPeriod(loanTerms.duration.period)
            }
          />
          <DetailItem label="Interval" value={formatInterval(loanTerms.interval)} />
          <DetailItem label="Annual Rate" value={`${loanTerms.annualRate}%`} />
        </div>
        <div className="grid ">
          <DetailItem label="Liquidation CVL" value={`${loanTerms.liquidationCvl}%`} />
          <DetailItem label="Margin Call CVL" value={`${loanTerms.marginCallCvl}%`} />
          <DetailItem label="Initial CVL" value={`${loanTerms.initialCvl}%`} />
        </div>
      </div>
    </div>
  )
}
