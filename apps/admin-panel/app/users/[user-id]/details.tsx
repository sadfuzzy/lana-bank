"use client"

import React from "react"
import { toast } from "sonner"

import {
  Role,
  GetUserDetailsQuery,
  useUserAssignRoleMutation,
  useUserRevokeRoleMutation,
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
}

const RolesDropDown = ({ userId, roles }: { userId: string; roles: Role[] }) => {
  const [assignRole, { loading: assigning, error: assignRoleError }] =
    useUserAssignRoleMutation()
  const [revokeRole, { loading: revoking, error: revokeError }] =
    useUserRevokeRoleMutation()

  const handleRoleChange = async (role: Role) => {
    if (roles.includes(role)) {
      try {
        await revokeRole({ variables: { input: { id: userId, role } } })
        toast.success("Role revoked")
      } catch (err) {
        toast.error(`Failed to revoke role, ${revokeError?.message}`)
      }
    } else {
      try {
        await assignRole({ variables: { input: { id: userId, role } } })
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

const UserDetailsCard: React.FC<UserDetailsProps> = ({ user }) => {
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

  const footer = <RolesDropDown userId={user.userId} roles={user.roles} />

  return <DetailsCard title="User" details={details} footerContent={footer} columns={3} />
}

export default UserDetailsCard
