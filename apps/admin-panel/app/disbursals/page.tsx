"use client"

import DisbursalsList from "./list"

import { ListPageBreadcrumb } from "@/components/breadcrumb-wrapper"

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/ui/card"

const Disbursals: React.FC = () => (
  <>
    <ListPageBreadcrumb currentPage="Disbursals" />
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
