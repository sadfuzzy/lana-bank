"use client"
import { gql } from "@apollo/client"
import { useTranslations } from "next-intl"

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
  const t = useTranslations("Users")

  const { data: usersList, loading } = useUsersQuery()

  const columns: Column<User>[] = [
    {
      key: "email",
      header: t("table.headers.email"),
    },
    {
      key: "roles",
      header: t("table.headers.roles"),
      render: (roles) => (
        <div className="flex flex-wrap gap-2 text-muted-foreground items-center">
          {roles.length > 0
            ? roles.map((role) => (
                <Badge variant="secondary" key={role}>
                  {formatRole(role)}
                </Badge>
              ))
            : t("table.noRolesAssigned")}
        </div>
      ),
    },
  ]

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={usersList?.users || []}
            columns={columns}
            loading={loading}
            emptyMessage={t("table.emptyMessage")}
            navigateTo={(user) => `/users/${user.userId}`}
          />
        </CardContent>
      </Card>
    </>
  )
}

export default UsersPage
