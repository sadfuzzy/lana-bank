"use client"

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@lana/web/ui/card"

import DisbursalsList from "./list"

const Disbursals: React.FC = () => (
  <>
    <Card>
      <CardHeader>
        <CardTitle>Disbursals</CardTitle>
        <CardDescription>Payments made from a credit facility to user</CardDescription>
      </CardHeader>
      <CardContent>
        <DisbursalsList />
      </CardContent>
    </Card>
  </>
)

export default Disbursals
