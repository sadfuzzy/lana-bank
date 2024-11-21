"use client"

import CustomersList from "./list"

import { ListPageBreadcrumb } from "@/components/breadcrumb-wrapper"

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/ui/card"

const Customers: React.FC = () => (
  <>
    <ListPageBreadcrumb currentPage="Customers" />
    <Card>
      <CardHeader>
        <CardTitle>Customers</CardTitle>
        <CardDescription>
          Individuals or entities who hold accounts, loans, or credit facilities with the
          bank
        </CardDescription>
      </CardHeader>
      <CardContent>
        <CustomersList />
      </CardContent>
    </Card>
  </>
)

export default Customers
