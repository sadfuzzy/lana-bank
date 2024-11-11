"use client"
import { gql } from "@apollo/client"
import { useState } from "react"
import Link from "next/link"
import { IoEllipsisHorizontal } from "react-icons/io5"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

import DataTable, { Column } from "../data-table"

import {
  GetUserDetailsDocument,
  Role,
  useUserAssignRoleMutation,
  useUserRevokeRoleMutation,
  useUsersQuery,
} from "@/lib/graphql/generated"
import { formatRole } from "@/lib/utils"
import { Button } from "@/components/primitive/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/primitive/dropdown-menu"
import { Badge } from "@/components/primitive/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/primitive/card"

gql`
  query Users {
    users {
      userId
      email
      roles
    }
  }

  mutation UserAssignRole($input: UserAssignRoleInput!) {
    userAssignRole(input: $input) {
      user {
        userId
        email
        roles
      }
    }
  }

  mutation UserRevokeRole($input: UserRevokeRoleInput!) {
    userRevokeRole(input: $input) {
      user {
        userId
        email
        roles
      }
    }
  }
`

const RolesDropDown = ({
  userId,
  roles,
  refetch,
}: {
  userId: string
  roles: Role[]
  refetch: () => void
}) => {
  const [checkedRoles, setCheckedRoles] = useState<Role[]>(roles)
  const [assignRole, { loading: assigning, error: assignRoleError }] =
    useUserAssignRoleMutation({
      refetchQueries: [GetUserDetailsDocument],
    })
  const [revokeRole, { loading: revoking, error: revokeError }] =
    useUserRevokeRoleMutation({
      refetchQueries: [GetUserDetailsDocument],
    })

  const handleRoleChange = async (role: Role) => {
    if (checkedRoles.includes(role)) {
      try {
        await revokeRole({ variables: { input: { id: userId, role } } })
        setCheckedRoles((prev) => prev.filter((r) => r !== role))
        refetch()
        toast.success("Role revoked")
      } catch (err) {
        toast.error(`Failed to revoke role, ${revokeError?.message}`)
      }
    } else {
      try {
        await assignRole({ variables: { input: { id: userId, role } } })
        setCheckedRoles((prev) => [...prev, role])
        refetch()
        toast.success("Role assigned")
      } catch (err) {
        toast.error(`Failed to assign role, ${assignRoleError?.message}`)
      }
    }
  }

  const handleTriggerClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleViewDetailsClick = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger onClick={handleTriggerClick} asChild>
        <Button variant="ghost" onClick={handleTriggerClick}>
          <IoEllipsisHorizontal className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent onClick={handleTriggerClick}>
        <Link href={`/users/${userId}`} onClick={handleViewDetailsClick}>
          <DropdownMenuItem>View details</DropdownMenuItem>
        </Link>
        <DropdownMenuLabel>Roles</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {Object.values(Role)
          .filter((role) => role !== Role.Superuser)
          .map((role) => (
            <DropdownMenuCheckboxItem
              key={role}
              checked={checkedRoles.includes(role)}
              onCheckedChange={() => handleRoleChange(role)}
              disabled={assigning || revoking}
              onClick={(e) => e.stopPropagation()}
            >
              {formatRole(role)}
            </DropdownMenuCheckboxItem>
          ))}
        {(assigning || revoking) && <div>Loading...</div>}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

type User = NonNullable<
  NonNullable<ReturnType<typeof useUsersQuery>["data"]>
>["users"][number]

function UsersPage() {
  const router = useRouter()
  const { data: usersList, refetch, loading } = useUsersQuery()

  const columns: Column<User>[] = [
    {
      key: "email",
      header: "Email",
      width: "33%",
    },
    {
      key: "roles",
      header: "Roles",
      width: "33%",
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
    {
      key: "userId",
      header: "",
      align: "right",
      width: "33%",
      render: (_, user) => (
        <div className="pr-8">
          <RolesDropDown refetch={refetch} userId={user.userId} roles={user.roles} />
        </div>
      ),
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Users</CardTitle>
        <CardDescription>Manage system users and their role assignments</CardDescription>
      </CardHeader>
      <CardContent>
        <DataTable
          data={usersList?.users || []}
          columns={columns}
          loading={loading}
          emptyMessage="No users found"
          rowClassName="cursor-pointer"
          onRowClick={(user) => router.push(`/users/${user.userId}`)}
        />
      </CardContent>
    </Card>
  )
}

export default UsersPage
