"use client"

import DisbursalsList from "./list"

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/ui/card"

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
