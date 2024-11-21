"use client"

import WithdrawalsList from "./list"

import { ListPageBreadcrumb } from "@/components/breadcrumb-wrapper"

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/ui/card"

const Withdrawals: React.FC = () => (
  <>
    <ListPageBreadcrumb currentPage="Withdrawals" />
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
