"use client"
import { LoanIcon } from "@/components/icons"
import {
  Key,
  KeyValueCell,
  KeyValueGroup,
  Value,
} from "@/components/primitive/aligned-key-value"
import { Button } from "@/components/primitive/button"
import {
  Card,
  CardContent,
  CardFooter,
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

type Props = {
  params: {
    "loan-id": string
  }
}

export default function LoanDetailsPage({ params }: Props) {
  const { "loan-id": loanId } = params
  console.log(loanId)

  return (
    <main className="max-w-[70rem] m-auto mt-10">
      <Card className="flex-col h-full">
        <CardHeader>
          <div className="flex align-middle items-center gap-4">
            <LoanIcon className="hidden md:block w-10 h-10" />
            <div className="flex flex-col gap-2">
              <CardTitle className="mt-2">Loan Details</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className="ml-8 gap-4 flex flex-col mt-2">
          <div className="flex justify-between">
            <div>
              <p className="text-sm">Fixed Rate Loan</p>
              <p className="font-semibold text-lg">Loan #123456789 </p>
            </div>
            <div className="text-right">
              <p className="text-sm">Refresh Print Export</p>
              <p className="font-semibold text-lg">October 31, 2024</p>
            </div>
          </div>
          <div className="flex gap-4 w-full">
            <LoanOverviewCard />
            <CollateralValueToLoanCard />
          </div>
          <LoanContractTerms />
        </CardContent>
        <LoanDetailsTable />
      </Card>
    </main>
  )
}

const CollateralValueToLoanCard = () => {
  const collateralValues = [
    {
      key: "Collateral Value",
      value: "$100,000",
    },
    {
      key: "Loan Amount",
      value: "$100,000",
    },
    {
      key: "APR",
      value: "$100,000",
    },
    {
      key: "Interest Accrued",
      value: "$100,000",
    },
    {
      key: "Balance (Principal + Interest)",
      value: "$100,000",
    },
  ]

  return (
    <Card variant="secondary" className="w-1/2">
      <CardHeader>
        <CardTitle>Collateral Value to Loan (CVL)</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col text-sm">
        <KeyValueGroup>
          {collateralValues.map(({ key, value }) => (
            <KeyValueCell className="p-0.5 px-3 hover:bg-primary-foreground" key={key}>
              <Key className="text-textColor-primary">{key}</Key>
              <Value>{value}</Value>
            </KeyValueCell>
          ))}
        </KeyValueGroup>
      </CardContent>
      <CardFooter>
        <Button>Top Up Collateral</Button>
      </CardFooter>
    </Card>
  )
}

const LoanOverviewCard = () => {
  const loanOverview = [
    {
      key: "Loan amount",
      value: "$100,000",
    },
    {
      key: "APR",
      value: "$100,000",
    },
    {
      key: "Interest accrued",
      value: "$100,000",
    },
    {
      key: "Duration",
      value: "6 months",
    },
    {
      key: "Balance (Principal + Interest)",
      value: "$100,000",
    },
  ]

  return (
    <Card variant="secondary" className="w-1/2">
      <CardHeader>
        <CardTitle>Loan Overview</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col text-sm">
        <KeyValueGroup>
          {loanOverview.map(({ key, value }) => (
            <KeyValueCell className="p-0.5 px-3 hover:bg-primary-foreground" key={key}>
              <Key className="text-textColor-primary">{key}</Key>
              <Value>{value}</Value>
            </KeyValueCell>
          ))}
        </KeyValueGroup>
      </CardContent>
      <CardFooter>
        <Button>Make a Payment</Button>
      </CardFooter>
    </Card>
  )
}

const LoanContractTerms = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Loan Contract Terms</CardTitle>
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
        <p className="mb-2">Collateral Value to Loan (CVL) Details.</p>
        <ul className="list-disc pl-5">
          <li>Target CVL: 150%</li>
          <li>Margin Call: 120%</li>
          <li>Loan Liquidation: 105%</li>
        </ul>
        <p className="mt-6">For questions or support, contact support@lavabank.sv</p>
      </CardContent>
    </Card>
  )
}

const LoanDetailsTable = () => {
  return (
    <CardContent>
      <Table className="w-11/12 m-auto mb-20 mt-6">
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Transaction ID</TableHead>
            <TableHead>Amount (BTC)</TableHead>
            <TableHead>USD Value</TableHead>
            <TableHead className="text-right">Entry</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>2021-09-01</TableCell>
            <TableCell>Loan Disbursement</TableCell>
            <TableCell>0x1234</TableCell>
            <TableCell>0.1</TableCell>
            <TableCell>$1000</TableCell>
            <TableCell className="text-right"> -$165.00</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>2021-09-01</TableCell>
            <TableCell>Loan Disbursement</TableCell>
            <TableCell>0x1234</TableCell>
            <TableCell>0.1</TableCell>
            <TableCell>$1000</TableCell>
            <TableCell className="text-right"> -$165.00</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>2021-09-01</TableCell>
            <TableCell>Loan Disbursement</TableCell>
            <TableCell>0x1234</TableCell>
            <TableCell>0.1</TableCell>
            <TableCell>$1000</TableCell>
            <TableCell className="text-right"> -$165.00</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </CardContent>
  )
}
