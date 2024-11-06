"use client"

import WithdrawalsList from "./list"

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/primitive/card"

const Withdrawals: React.FC = () => (
  <Card>
    <CardHeader>
      <CardTitle>Withdrawals</CardTitle>
      <CardDescription>Money taken out from customer&apos;s accounts</CardDescription>
    </CardHeader>
    <CardContent>
      <WithdrawalsList />
    </CardContent>
  </Card>
)

export default Withdrawals
