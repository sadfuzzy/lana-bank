"use client"

import React from "react"
import { toast } from "sonner"

import {
  Role,
  GetUserDetailsQuery,
  useUserAssignRoleMutation,
  useUserRevokeRoleMutation,
  GetUserDetailsDocument,
} from "@/lib/graphql/generated"
import { DetailsCard, DetailItemProps } from "@/components/details"
import { Button } from "@/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/ui/dropdown-menu"
import { Badge } from "@/ui/badge"
import { formatDate, formatRole } from "@/lib/utils"

type UserDetailsProps = {
  user: NonNullable<GetUserDetailsQuery["user"]>
  refetch: () => void
}

const RolesDropDown = ({
  userId,
  roles,
  refetch,
}: {
  userId: string
  roles: Role[]
  refetch: () => void
}) => {
  const [assignRole, { loading: assigning, error: assignRoleError }] =
    useUserAssignRoleMutation({
      refetchQueries: [GetUserDetailsDocument],
    })
  const [revokeRole, { loading: revoking, error: revokeError }] =
    useUserRevokeRoleMutation({
      refetchQueries: [GetUserDetailsDocument],
    })

  const handleRoleChange = async (role: Role) => {
    if (roles.includes(role)) {
      try {
        await revokeRole({ variables: { input: { id: userId, role } } })
        refetch()
        toast.success("Role revoked")
      } catch (err) {
        toast.error(`Failed to revoke role, ${revokeError?.message}`)
      }
    } else {
      try {
        await assignRole({ variables: { input: { id: userId, role } } })
        refetch()
        toast.success("Role assigned")
      } catch (err) {
        toast.error(`Failed to assign role, ${assignRoleError?.message}`)
      }
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild data-testid="user-details-manage-role">
        <Button variant="outline">Manage Roles</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Roles</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {Object.values(Role)
          .filter((role) => role !== Role.Superuser)
          .map((role) => (
            <DropdownMenuCheckboxItem
              key={role}
              checked={roles.includes(role)}
              onCheckedChange={() => handleRoleChange(role)}
              disabled={assigning || revoking}
              data-testid={`user-details-manage-role-${role.toLowerCase()}-checkbox`}
            >
              {formatRole(role)}
            </DropdownMenuCheckboxItem>
          ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const UserDetailsCard: React.FC<UserDetailsProps> = ({ user, refetch }) => {
  const details: DetailItemProps[] = [
    { label: "Created At", value: formatDate(user.createdAt) },
    { label: "Email", value: user.email, valueTestId: "user-details-email" },
    {
      label: "Roles",
      value: (
        <div className="flex flex-wrap gap-2">
          {user.roles.length > 0 ? (
            user.roles.map((role) => (
              <Badge
                variant={role === Role.Superuser ? "success" : "secondary"}
                key={role}
              >
                {formatRole(role)}
              </Badge>
            ))
          ) : (
            <span className="text-muted-foreground">No roles assigned</span>
          )}
        </div>
      ),
    },
  ]

  const footer = (
    <RolesDropDown userId={user.userId} roles={user.roles} refetch={refetch} />
  )

  return <DetailsCard title="User" details={details} footerContent={footer} columns={3} />
}

export default UserDetailsCard
