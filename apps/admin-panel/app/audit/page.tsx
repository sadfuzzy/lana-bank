"use client"

import { gql } from "@apollo/client"

import { PageHeading } from "@/components/page-heading"
import { useAuditEntriesQuery } from "@/lib/graphql/generated"

gql`
  query AuditEntries {
    audit {
      id
      subject
      object
      action
      authorized
      createdAt
    }
  }
`

function LogsPage() {
  const { data: logDetails } = useAuditEntriesQuery({})

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
              {logDetails?.audit.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                    {item.subject}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {item.object}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                    {item.action}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {item.authorized ? "Yes" : "No"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {item.createdAt}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}

export default LogsPage
