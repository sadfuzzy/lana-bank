"use client"

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@lana/web/ui/card"

import CustomersList from "./list"

const Customers: React.FC = () => (
  <>
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
