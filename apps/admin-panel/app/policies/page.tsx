"use client"

import PolicyList from "./list"

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/primitive/card"

const Policies: React.FC = () => (
  <Card>
    <CardHeader>
      <CardTitle>Policies</CardTitle>
      <CardDescription>
        Policies define the approval process for different types of transactions.
      </CardDescription>
    </CardHeader>
    <CardContent>
      <PolicyList />
    </CardContent>
  </Card>
)

export default Policies
