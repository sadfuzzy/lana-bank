"use client"

import React from "react"
import { toast } from "sonner"
import { useTranslations } from "next-intl"

import { Button } from "@lana/web/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@lana/web/ui/dropdown-menu"
import { Badge } from "@lana/web/ui/badge"

import { DetailsCard, DetailItemProps } from "@/components/details"
import {
  Role,
  GetUserDetailsQuery,
  useUserAssignRoleMutation,
  useUserRevokeRoleMutation,
} from "@/lib/graphql/generated"
import { formatDate, formatRole } from "@/lib/utils"

type UserDetailsProps = {
  user: NonNullable<GetUserDetailsQuery["user"]>
}

const RolesDropDown = ({ userId, roles }: { userId: string; roles: Role[] }) => {
  const t = useTranslations("Users.userDetails")

  const [assignRole, { loading: assigning, error: assignRoleError }] =
    useUserAssignRoleMutation()
  const [revokeRole, { loading: revoking, error: revokeError }] =
    useUserRevokeRoleMutation()

  const handleRoleChange = async (role: Role) => {
    if (roles.includes(role)) {
      try {
        await revokeRole({ variables: { input: { id: userId, role } } })
        toast.success(t("roleDropdown.success.roleRevoked"))
      } catch (err) {
        toast.error(`${t("roleDropdown.errors.revokeFailed")}, ${revokeError?.message}`)
      }
    } else {
      try {
        await assignRole({ variables: { input: { id: userId, role } } })
        toast.success(t("roleDropdown.success.roleAssigned"))
      } catch (err) {
        toast.error(
          `${t("roleDropdown.errors.assignFailed")}, ${assignRoleError?.message}`,
        )
      }
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild data-testid="user-details-manage-role">
        <Button variant="outline">{t("roleDropdown.manageRoles")}</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>{t("roleDropdown.rolesLabel")}</DropdownMenuLabel>
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
  const t = useTranslations("Users.userDetails")

  const details: DetailItemProps[] = [
    { label: t("fields.createdAt"), value: formatDate(user.createdAt) },
    { label: t("fields.email"), value: user.email, valueTestId: "user-details-email" },
    {
      label: t("fields.roles"),
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
            <span className="text-muted-foreground">{t("noRolesAssigned")}</span>
          )}
        </div>
      ),
    },
  ]

  const footer = <RolesDropDown userId={user.userId} roles={user.roles} />

  return (
    <DetailsCard
      title={t("title")}
      details={details}
      footerContent={footer}
      columns={3}
    />
  )
}

export default UserDetailsCard
