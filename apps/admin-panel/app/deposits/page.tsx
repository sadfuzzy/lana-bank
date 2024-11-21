"use client"

import DepositsList from "./list"

import { ListPageBreadcrumb } from "@/components/breadcrumb-wrapper"

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/ui/card"

const Deposits: React.FC = () => (
  <>
    <ListPageBreadcrumb currentPage="Deposits" />
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
