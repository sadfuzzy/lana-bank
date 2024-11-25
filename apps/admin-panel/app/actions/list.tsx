"use client"

import Link from "next/link"
import { gql } from "@apollo/client"
import { HiCheckCircle } from "react-icons/hi"
import { useRouter } from "next/navigation"

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/ui/card"
import {
  ApprovalProcessStatus,
  ApprovalProcessType,
  useAllActionsQuery,
} from "@/lib/graphql/generated"
import { formatDate, formatProcessType } from "@/lib/utils"
import { CardSkeleton } from "@/components/card-skeleton"
import DataTable, { Column } from "@/components/data-table"

const NUMBER_OF_ITEMS_IN_DASHBOARD = 3

gql`
  query AllActions {
    approvalProcesses(first: 1000000) {
      pageInfo {
        hasNextPage
        hasPreviousPage
      }
      edges {
        node {
          id
          approvalProcessType
          status
          subjectCanSubmitDecision
          createdAt
          target {
            __typename
            ... on Withdrawal {
              withdrawalId
              customer {
                email
              }
            }
            ... on CreditFacility {
              creditFacilityId
              customer {
                email
              }
            }
            ... on CreditFacilityDisbursal {
              id
              index
              disbursalId
              creditFacility {
                customer {
                  email
                }
              }
            }
          }
        }
        cursor
      }
    }
  }
`

type ListProps = {
  dashboard?: boolean
}

type ActionNode = NonNullable<
  NonNullable<
    NonNullable<
      ReturnType<typeof useAllActionsQuery>["data"]
    >["approvalProcesses"]["edges"][number]
  >["node"]
>

const List: React.FC<ListProps> = ({ dashboard = false }) => {
  const router = useRouter()
  const { data, loading } = useAllActionsQuery()

  const approvalProcesses =
    data?.approvalProcesses.edges
      .filter((e) => e.node.subjectCanSubmitDecision)
      .filter((e) => e.node.status === ApprovalProcessStatus.InProgress)
      .map((e) => e.node) || []

  const tableData = dashboard
    ? approvalProcesses.slice(0, NUMBER_OF_ITEMS_IN_DASHBOARD)
    : approvalProcesses

  const more = approvalProcesses.length - NUMBER_OF_ITEMS_IN_DASHBOARD

  if (loading) return <CardSkeleton />

  const handleRowClick = (data: ActionNode) => {
    if (
      data.approvalProcessType === ApprovalProcessType.CreditFacilityApproval &&
      data.target.__typename === "CreditFacility"
    ) {
      router.push(`/credit-facilities/${data.target.creditFacilityId}`)
    } else if (
      data.approvalProcessType === ApprovalProcessType.WithdrawalApproval &&
      data.target.__typename === "Withdrawal"
    ) {
      router.push(`/withdrawals/${data.target.withdrawalId}`)
    } else if (
      data.approvalProcessType === ApprovalProcessType.DisbursalApproval &&
      data.target.__typename === "CreditFacilityDisbursal"
    ) {
      router.push(`/disbursals/${data.target.disbursalId}`)
    }
  }

  const columns: Column<ActionNode>[] = [
    {
      key: "target",
      header: "Customer",
      render: (target) =>
        target.__typename === "CreditFacilityDisbursal"
          ? target.creditFacility.customer.email
          : target.customer.email,
    },
    {
      key: "approvalProcessType",
      header: "Type",
      render: (type) => formatProcessType(type),
    },
    {
      key: "createdAt",
      header: "Date",
      render: (date) => formatDate(date),
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Actions</CardTitle>
        <CardDescription>Approvals / Rejections waiting your way</CardDescription>
      </CardHeader>

      {tableData.length > 0 ? (
        <CardContent>
          <DataTable
            data={tableData}
            columns={columns}
            onRowClick={handleRowClick}
            className="w-full"
          />
          {dashboard && more > 0 && (
            <div className="mt-4 flex items-center gap-2">
              <Link href="/actions" className="text-sm text-muted-foreground">
                ...{more} more
              </Link>
            </div>
          )}
        </CardContent>
      ) : (
        <CardContent className="flex flex-col items-start justify-center w-full gap-2">
          <HiCheckCircle className="text-6xl text-green-500" />
          <div className="text-sm">All Caught Up</div>
        </CardContent>
      )}
    </Card>
  )
}

export default List
