"use client"

import CustomersList from "./list"

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/primitive/card"

const CreditFacilities: React.FC = () => (
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
)

export default CreditFacilities
