"use client"

import CommitteesList from "./list"

import { ListPageBreadcrumb } from "@/components/breadcrumb-wrapper"

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/primitive/card"

const Committees: React.FC = () => (
  <>
    <ListPageBreadcrumb currentPage="Committees" />
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
