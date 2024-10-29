"use client"
import { useState } from "react"
import { gql } from "@apollo/client"

import { ApprovalDialog } from "./approve"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/primitive/table"
import { Card, CardContent } from "@/components/primitive/card"
import { Button } from "@/components/primitive/button"
import { PageHeading } from "@/components/page-heading"
import { useApprovalProcessesQuery } from "@/lib/graphql/generated"
import { formatDate } from "@/lib/utils"

gql`
  query ApprovalProcesses($first: Int!, $after: String) {
    approvalProcesses(first: $first, after: $after) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        cursor
        node {
          id
          approvalProcessId
          processType
          createdAt
        }
      }
    }
  }
`

export default function ApprovalProcessesTable() {
  const [selectedProcess, setSelectedProcess] = useState<string | null>(null)

  const { data, loading, error, fetchMore, refetch } = useApprovalProcessesQuery({
    variables: { first: 20 },
    fetchPolicy: "cache-and-network",
  })

  const handleLoadMore = () => {
    if (data?.approvalProcesses.pageInfo?.hasNextPage) {
      fetchMore({
        variables: {
          after: data.approvalProcesses.pageInfo.endCursor,
          first: 20,
        },
      })
    }
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <main>
      <div className="flex justify-between items-center mb-8">
        <PageHeading className="mb-0">Approval Processes</PageHeading>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Process ID</TableHead>
                <TableHead>Process Type</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.approvalProcesses.edges.map(({ node: process }) => (
                <TableRow key={process.approvalProcessId}>
                  <TableCell>{process.approvalProcessId}</TableCell>
                  <TableCell>{process.processType}</TableCell>
                  <TableCell>{formatDate(process.createdAt)}</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      onClick={() => setSelectedProcess(process.approvalProcessId)}
                    >
                      Approve
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {data?.approvalProcesses.pageInfo?.hasNextPage && (
            <div className="flex justify-center mt-4">
              <Button variant="ghost" onClick={handleLoadMore}>
                Load More
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <ApprovalDialog
        processId={selectedProcess || ""}
        openApprovalDialog={Boolean(selectedProcess)}
        setOpenApprovalDialog={() => {
          setSelectedProcess(null)
        }}
        refetch={refetch}
      />
    </main>
  )
}
