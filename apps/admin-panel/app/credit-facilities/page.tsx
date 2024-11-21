"use client"

import CustomersList from "./list"

import { ListPageBreadcrumb } from "@/components/breadcrumb-wrapper"

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/ui/card"

const CreditFacilities: React.FC = () => (
  <>
    <ListPageBreadcrumb currentPage="Credit Facilities" />
    <Card>
      <CardHeader>
        <CardTitle>Credit Facilities</CardTitle>
        <CardDescription>
          Pre-approved financial arrangements allowing borrowers to access funds up to a
          certain limit as needed
        </CardDescription>
      </CardHeader>
      <CardContent>
        <CustomersList />
      </CardContent>
    </Card>
  </>
)

export default CreditFacilities
