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

export const LoanCard = () => {
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
      </CardContent>
    </Card>
  )
}
