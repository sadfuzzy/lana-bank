"use client"

import { gql } from "@apollo/client"

import { PageHeading } from "@/components/page-heading"
import { useAuditLogsQuery } from "@/lib/graphql/generated"

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
            ... on Customer {
              customerId
              email
              status
              level
              applicantId
            }
            ... on System {
              name
            }
          }
          object
          action
          authorized
          createdAt
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`

function LogsPage() {
  const { data, fetchMore, loading } = useAuditLogsQuery({ variables: { first: 100 } })

  const handleFetchMore = async () => {
    if (data?.audit.pageInfo.hasNextPage && !loading) {
      await fetchMore({
        variables: {
          after: data.audit.pageInfo.endCursor,
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult) return prev
          return {
            audit: {
              ...fetchMoreResult.audit,
              edges: [...prev.audit.edges, ...fetchMoreResult.audit.edges],
            },
          }
        },
      })
    }
  }
  return (
    <main className="text-white min-h-screen p-4">
      <div className="flex flex-col mb-8">
        <PageHeading className="mb-4 text-white">Logs</PageHeading>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-800">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                >
                  Type
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                >
                  Subject
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                >
                  Object
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                >
                  Action
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                >
                  Authorized
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                >
                  Created At
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {data?.audit.edges.map((item) => (
                <tr key={item.node.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                    {item.node.subject.__typename}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                    {item.node.subject.__typename === "User"
                      ? item.node.subject.email
                      : ""}
                    {item.node.subject.__typename === "Customer"
                      ? item.node.subject.email
                      : ""}
                    {item.node.subject.__typename === "System"
                      ? item.node.subject.name
                      : ""}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {item.node.object}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                    {item.node.action}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {item.node.authorized ? "Yes" : "No"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {item.node.createdAt}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {data?.audit.pageInfo.hasNextPage && (
            <div className="flex justify-center mt-4">
              <button
                onClick={handleFetchMore}
                className="px-4 py-2 text-sm font-medium text-gray-200 bg-gray-700 rounded hover:bg-gray-600"
                disabled={loading}
              >
                {loading ? "Loading..." : "Show more"}
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

export default LogsPage
