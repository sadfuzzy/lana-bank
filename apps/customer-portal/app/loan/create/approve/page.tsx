"use client"
import Link from "next/link"

import { LoanIcon } from "@/components/icons"
import { Button } from "@/components/primitive/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/primitive/card"
import { Checkbox } from "@/components/primitive/check-box"
import { Label } from "@/components/primitive/label"
import {
  Key,
  KeyValueCell,
  KeyValueGroup,
  Value,
} from "@/components/primitive/aligned-key-value"

export default function ApproveLoanPage() {
  return (
    <main className="max-w-[70rem] m-auto mt-10">
      <Card className="flex-col h-full">
        <CardHeader>
          <div className="flex align-middle gap-4">
            <LoanIcon className="hidden md:block w-10 h-10" />
            <div className="flex flex-col gap-2">
              <CardTitle className="mt-2">Start a new Loan</CardTitle>
              <CardDescription>Review details and sign loan contract.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="ml-8 flex flex-col md:flex-row justify-between">
          <div className="w-1/2">
            <LoanDetails />
            <LoanCollateralDetails />
          </div>
          <div className="w-2/3">
            <LoanContractTerms />
          </div>
        </CardContent>
      </Card>
    </main>
  )
}

const LoanDetails = () => {
  const loanDetails = [
    {
      key: "USD Loan",
      value: "$100,000",
    },
    {
      key: "Collateral Value to Loan",
      value: "$100,000",
    },
    {
      key: "Fees",
      value: "$100,000",
    },
    {
      key: "Duration",
      value: "$100,000",
    },
    {
      key: "Interest",
      value: "$100,000",
    },
  ]

  return (
    <Card variant="transparent">
      <CardHeader>
        <CardTitle>Loan Details</CardTitle>
      </CardHeader>

      <CardContent className="text-sm">
        <KeyValueGroup>
          {loanDetails.map(({ key, value }) => (
            <KeyValueCell key={key}>
              <Key>{key}</Key>
              <Value>{value}</Value>
            </KeyValueCell>
          ))}
        </KeyValueGroup>
      </CardContent>
    </Card>
  )
}

const LoanCollateralDetails = () => {
  const loanCollateralDetails = [
    {
      key: "Collateral required",
      value: "2.38021243 BTC",
    },
    {
      key: "BTC Account Balance",
      value: "2.38021243 BTC",
    },
  ]

  return (
    <Card variant="transparent">
      <CardHeader>
        <CardTitle>Collateral Details</CardTitle>
      </CardHeader>
      <CardContent className="text-sm">
        <KeyValueGroup>
          {loanCollateralDetails.map(({ key, value }) => (
            <KeyValueCell key={key}>
              <Key>{key}</Key>
              <Value>{value}</Value>
            </KeyValueCell>
          ))}
        </KeyValueGroup>
      </CardContent>
      <CardFooter className="gap-4 flex flex-col items-start mt-4">
        <div className="flex gap-2 items-center">
          <Checkbox />
          <Label>Agree to full terms and conditions</Label>
        </div>
        <div className="flex gap-2 items-center">
          <Checkbox />
          <Label>Pledge collateral from my Lava Bank BTC Account</Label>
        </div>
        <div className="flex gap-2 items-center align-middle">
          <Link href="/loan/create/approve" className="flex justify-start mt-4">
            <Button>Deposit BTC</Button>
          </Link>
          <p className="mt-4 ml-4">or edit loan details</p>
        </div>
      </CardFooter>
    </Card>
  )
}

const LoanContractTerms = () => {
  return (
    <Card variant="secondary">
      <CardHeader>
        <CardTitle>Loan Contract Terms</CardTitle>
        <CardDescription>
          Please review the following terms and details carefully before initiating your
          new loan.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="list-disc pl-5">
          <li>Interest Rate: 5% (fixed for 6 month term)</li>
          <li>
            Interest Accrual: Monthly Payment Schedule: Full repayment upon term end
          </li>
          <li>Early Repayment Penalty: None Loan Disbursement Time: Within 24 to 48</li>
          <li>hours after approval</li>
        </ul>
      </CardContent>
      <CardContent>
        <p className="text-textColor-secondary text-sm mb-2">
          Collateral Value to Loan (CVL) Details.
        </p>
        <ul className="list-disc pl-5">
          <li>Target CVL: 150%</li>
          <li>Margin Call: 120%</li>
          <li>Loan Liquidation: 105%</li>
        </ul>
      </CardContent>
      <CardContent>
        Once you have read and agreed to the loan contract, click Sign & Initiate Loan to
        complete the loan process.
      </CardContent>
    </Card>
  )
}
