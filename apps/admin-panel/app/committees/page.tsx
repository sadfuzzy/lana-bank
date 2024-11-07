"use client"

import CommitteesList from "./list"

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/primitive/card"

const Committees: React.FC = () => (
  <Card>
    <CardHeader>
      <CardTitle>Committees</CardTitle>
      <CardDescription>Manage approval committees and their members</CardDescription>
    </CardHeader>
    <CardContent>
      <CommitteesList />
    </CardContent>
  </Card>
)

export default Committees
