"use client"
import { gql } from "@apollo/client"

import { Badge } from "@lana/web/ui/badge"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@lana/web/ui/card"

import DataTable, { Column } from "../../components/data-table"

import { useUsersQuery } from "@/lib/graphql/generated"
import { formatRole } from "@/lib/utils"

gql`
  fragment UserFields on User {
    id
    userId
    email
    roles
    createdAt
  }

  query Users {
    users {
      ...UserFields
    }
  }

  mutation UserAssignRole($input: UserAssignRoleInput!) {
    userAssignRole(input: $input) {
      user {
        ...UserFields
      }
    }
  }

  mutation UserRevokeRole($input: UserRevokeRoleInput!) {
    userRevokeRole(input: $input) {
      user {
        ...UserFields
      }
    }
  }
`

type User = NonNullable<
  NonNullable<ReturnType<typeof useUsersQuery>["data"]>
>["users"][number]

function UsersPage() {
  const { data: usersList, loading } = useUsersQuery()

  const columns: Column<User>[] = [
    {
      key: "email",
      header: "Email",
    },
    {
      key: "roles",
      header: "Roles",
      render: (roles) => (
        <div className="flex flex-wrap gap-2 text-muted-foreground items-center">
          {roles.length > 0
            ? roles.map((role) => (
                <Badge variant="secondary" key={role}>
                  {formatRole(role)}
                </Badge>
              ))
            : "No roles Assigned"}
        </div>
      ),
    },
  ]

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>
            Manage system users and their role assignments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={usersList?.users || []}
            columns={columns}
            loading={loading}
            emptyMessage="No users found"
            navigateTo={(user) => `/users/${user.userId}`}
          />
        </CardContent>
      </Card>
    </>
  )
}

export default UsersPage
