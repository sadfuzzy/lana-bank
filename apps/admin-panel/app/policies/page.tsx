"use client"

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@lana/web/ui/card"

import PolicyList from "./list"

const Policies: React.FC = () => (
  <>
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
  </>
)

export default Policies
