"use client"

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@lana/web/ui/card"

import CommitteesList from "./list"

const Committees: React.FC = () => (
  <>
    <Card>
      <CardHeader>
        <CardTitle>Committees</CardTitle>
        <CardDescription>Manage approval committees and their members</CardDescription>
      </CardHeader>
      <CardContent>
        <CommitteesList />
      </CardContent>
    </Card>
  </>
)

export default Committees
