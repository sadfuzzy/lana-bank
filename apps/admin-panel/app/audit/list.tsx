"use client"
import { gql } from "@apollo/client"

import { AuditEntry, useAuditLogsQuery } from "@/lib/graphql/generated"
import PaginatedTable, {
  Column,
  DEFAULT_PAGESIZE,
  PaginatedData,
} from "@/components/paginated-table"
import { formatDate } from "@/lib/utils"

gql`
  query AuditLogs($first: Int!, $after: String) {
    audit(first: $first, after: $after) {
      edges {
        cursor
        node {
          id
          subject {
            ... on User {
              userId
              email
              roles
            }
            ... on System {
              name
            }
          }
          object
          action
          authorized
          recordedAt
        }
      }
      pageInfo {
        endCursor
        startCursor
        hasNextPage
        hasPreviousPage
      }
    }
  }
`

const AuditLogsList = () => {
  const { data, loading, error, fetchMore } = useAuditLogsQuery({
    variables: {
      first: DEFAULT_PAGESIZE,
    },
    fetchPolicy: "cache-and-network",
  })

  return (
    <div>
      {error && <p className="text-destructive text-sm">{error?.message}</p>}
      <PaginatedTable<AuditEntry>
        columns={columns}
        data={data?.audit as PaginatedData<AuditEntry>}
        loading={loading}
        pageSize={DEFAULT_PAGESIZE}
        fetchMore={async (cursor) => fetchMore({ variables: { after: cursor } })}
      />
    </div>
  )
}

export default AuditLogsList

const columns: Column<AuditEntry>[] = [
  {
    key: "subject",
    label: "Subject",
    render: (subject) => (
      <div>{subject.__typename === "User" ? subject.email : subject.__typename}</div>
    ),
  },
  { key: "object", label: "Object" },
  { key: "action", label: "Action" },
  {
    key: "recordedAt",
    label: "Recorded At",
    render: (date) => formatDate(date),
  },
]
