"use client"

import { gql } from "@apollo/client"

import { Policy, usePoliciesQuery } from "@/lib/graphql/generated"
import PaginatedTable, {
  Column,
  DEFAULT_PAGESIZE,
  PaginatedData,
} from "@/components/paginated-table"
import { formatProcessType } from "@/lib/utils"

gql`
  query Policies($first: Int!, $after: String) {
    policies(first: $first, after: $after) {
      edges {
        cursor
        node {
          id
          policyId
          approvalProcessType
          rules {
            ... on CommitteeThreshold {
              threshold
              committee {
                id
                committeeId
                createdAt
                name
              }
            }
            ... on SystemApproval {
              autoApprove
            }
          }
        }
      }
      pageInfo {
        hasPreviousPage
        hasNextPage
        startCursor
        endCursor
      }
    }
  }
`

const PolicyList = () => {
  const { data, loading, error, fetchMore } = usePoliciesQuery({
    variables: {
      first: DEFAULT_PAGESIZE,
    },
    fetchPolicy: "cache-and-network",
  })

  return (
    <div>
      {error && <p className="text-destructive text-sm">{error?.message}</p>}
      <PaginatedTable
        columns={columns}
        data={data?.policies as PaginatedData<Policy>}
        loading={loading}
        fetchMore={async (cursor) => fetchMore({ variables: { after: cursor } })}
        pageSize={DEFAULT_PAGESIZE}
        navigateTo={(policy) => `/policies/${policy.policyId}`}
      />
    </div>
  )
}

export default PolicyList

const columns: Column<Policy>[] = [
  {
    key: "approvalProcessType",
    label: "Process Type",
    render: (type) => formatProcessType(type),
  },
  {
    key: "rules",
    label: "Rule",
    render: (rules) => {
      if (rules.__typename === "CommitteeThreshold") {
        return `${rules.committee.name} Committee`
      }
      if (rules.__typename === "SystemApproval") {
        return <span className="text-textColor-secondary">System</span>
      }
      return ""
    },
  },
]
