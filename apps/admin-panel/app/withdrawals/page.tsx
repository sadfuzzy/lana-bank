"use client"

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@lana/web/ui/card"

import WithdrawalsList from "./list"

const Withdrawals: React.FC = () => (
  <>
    <Card>
      <CardHeader>
        <CardTitle>Withdrawals</CardTitle>
        <CardDescription>Money taken out from customer&apos;s accounts</CardDescription>
      </CardHeader>
      <CardContent>
        <WithdrawalsList />
      </CardContent>
    </Card>
  </>
)

export default Withdrawals
