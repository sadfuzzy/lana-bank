"use client"

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@lana/web/ui/card"

import DepositsList from "./list"

const Deposits: React.FC = () => (
  <>
    <Card>
      <CardHeader>
        <CardTitle>Deposits</CardTitle>
        <CardDescription>
          Sums of money added from credit facilities into customer&apos;s accounts
        </CardDescription>
      </CardHeader>
      <CardContent>
        <DepositsList />
      </CardContent>
    </Card>
  </>
)

export default Deposits
