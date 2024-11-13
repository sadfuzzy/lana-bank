"use client"

import PolicyList from "./list"

import { ListPageBreadcrumb } from "@/components/breadcrumb-wrapper"

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/primitive/card"

const Policies: React.FC = () => (
  <>
    <ListPageBreadcrumb currentPage="Policies" />
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
