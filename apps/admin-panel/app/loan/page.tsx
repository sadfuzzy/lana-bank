"use client"
import React, { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"

import { Button } from "@/components/primitive/button"
import { Input } from "@/components/primitive/input"
import { Label } from "@/components/primitive/label"
import { Card, CardContent, CardHeader } from "@/components/primitive/card"
import { Separator } from "@/components/primitive/separator"
import { PageHeading } from "@/components/page-heading"
import { DetailItem, DetailsGroup } from "@/components/details"
import { currencyConverter, formatCurrency } from "@/lib/utils"
import { LoanStatus, useGetLoanDetailsQuery } from "@/lib/graphql/generated"
import { LoanPartialPaymentDialog } from "@/components/loan/loan-partial-payment"
import { LoanApproveDialog } from "@/components/loan/approve-loan"
import { LoanBadge } from "@/components/loan/loan-badge"

function LoanPage() {
  const searchParams = useSearchParams()
  const loanIdParam = searchParams.get("loanId")
  const router = useRouter()

  const [loanId, setLoanId] = useState(loanIdParam)
  const [inputLoanId, setInputLoanId] = useState("")

  useEffect(() => {
    setLoanId(loanIdParam)
  }, [loanIdParam])

  const {
    loading,
    error,
    data: loanDetails,
    refetch,
  } = useGetLoanDetailsQuery({
    skip: !loanId,
    variables: {
      id: loanId || "",
    },
  })

  useEffect(() => {
    if (loanId) {
      const interval = setInterval(() => {
        refetch()
      }, 10000)
      return () => clearInterval(interval)
    }
  }, [loanId, refetch])

  const handleSearch = () => {
    router.push(`?loanId=${inputLoanId}`)
  }

  return (
    <main>
      <PageHeading>Loan</PageHeading>
      <div className="mt-4 mb-4 max-w-[30rem]">
        <Label htmlFor="loanId">Loan ID</Label>
        <div className="flex gap-2">
          <Input
            onChange={(e) => setInputLoanId(e.target.value)}
            placeholder="Find a loan by loan ID"
            id="loanId"
            name="loanId"
            value={inputLoanId}
          />
          <Button onClick={handleSearch} variant="secondary">
            Search
          </Button>
        </div>
      </div>

      <Card className="max-w-[60rem]">
        {loading ? (
          <CardContent className="pt-6">Loading...</CardContent>
        ) : error ? (
          <CardContent className="pt-6">{error.message}</CardContent>
        ) : loanDetails?.loan ? (
          <>
            <CardHeader className="flex flex-row justify-between items-center">
              <div>
                <h2 className="font-semibold leading-none tracking-tight">
                  Loan Details
                </h2>
                <p className="text-textColor-secondary text-sm mt-2">
                  {loanDetails.loan.loanId}
                </p>
              </div>
              <LoanBadge status={loanDetails.loan.status} className="p-1 px-4" />
            </CardHeader>
            <CardContent>
              <Separator className="mb-6" />
              <DetailsGroup>
                <DetailItem label="User ID" value={loanDetails.loan.user.userId} />
                <DetailItem
                  label="Collateral balance (BTC)"
                  value={`${loanDetails.loan.balance.collateral.btcBalance} sats`}
                />
                <DetailItem
                  label="Outstanding balance (USD)"
                  value={formatCurrency({
                    amount: currencyConverter.centsToUsd(
                      loanDetails.loan.balance.outstanding.usdBalance,
                    ),
                    currency: "USD",
                  })}
                />
                <DetailItem
                  label="Interest Incurred (USD)"
                  value={formatCurrency({
                    amount: currencyConverter.centsToUsd(
                      loanDetails.loan.balance.interestIncurred.usdBalance,
                    ),
                    currency: "USD",
                  })}
                />
              </DetailsGroup>
              <div className="flex flex-row gap-2">
                {loanDetails.loan.status === LoanStatus.Active && (
                  <LoanPartialPaymentDialog
                    refetch={refetch}
                    loanId={loanDetails.loan.loanId}
                  >
                    <Button variant="secondary" className="mt-6">
                      Make Partial Payment
                    </Button>
                  </LoanPartialPaymentDialog>
                )}
                {loanDetails.loan.status === LoanStatus.New && (
                  <LoanApproveDialog refetch={refetch} loanId={loanDetails.loan.loanId}>
                    <Button variant="secondary" className="mt-6">
                      Approve Loan
                    </Button>
                  </LoanApproveDialog>
                )}
              </div>
            </CardContent>
          </>
        ) : loanId && !loanDetails?.loan ? (
          <CardContent className="pt-6">No loan found with this ID</CardContent>
        ) : (
          <CardContent className="pt-6">Enter a loan ID to find a Loan</CardContent>
        )}
      </Card>
    </main>
  )
}

export default LoanPage
