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
import { DetailItem } from "@/components/details"
import { Card, CardContent, CardHeader } from "@/components/primitive/card"
import { Checkbox } from "@/components/primitive/check-box"
import { formatRole } from "@/lib/utils"
import { Badge } from "@/components/primitive/badge"

type UserDetailsProps = {
  user: NonNullable<GetUserDetailsQuery["user"]>
  refetch: () => void
}

const UserDetailsCard: React.FC<UserDetailsProps> = ({ user, refetch }) => {
  const [assignRole, { loading: assigning, error: assignRoleError }] =
    useUserAssignRoleMutation({
      refetchQueries: [GetUserDetailsDocument],
    })
  const [revokeRole, { loading: revoking, error: revokeError }] =
    useUserRevokeRoleMutation({
      refetchQueries: [GetUserDetailsDocument],
    })

  const handleRoleChange = async (role: Role) => {
    if (user.roles.includes(role)) {
      try {
        await revokeRole({ variables: { input: { id: user.userId, role } } })
        refetch()
        toast.success("Role revoked")
      } catch (err) {
        toast.error(`Failed to revoke role, ${revokeError?.message}`)
      }
    } else {
      try {
        await assignRole({ variables: { input: { id: user.userId, role } } })
        refetch()
        toast.success("Role assigned")
      } catch (err) {
        toast.error(`Failed to assign role, ${assignRoleError?.message}`)
      }
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row justify-between items-center">
        <h2 className="font-semibold leading-none tracking-tight">User</h2>
        {user.roles.includes(Role.Superuser) && (
          <Badge variant="success" className="uppercase text-sm">
            {formatRole(Role.Superuser)}
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        <div className="grid grid-rows-min">
          <DetailItem label="Email" value={user.email} />
          <DetailItem label="User ID" value={user.userId} />
        </div>
        <div className="mt-4 grid grid-rows-min">
          <h3 className="ml-2 font-semibold leading-none tracking-tight">Roles</h3>
          <div className="ml-2 mt-4 flex space-y-1 flex-col">
            {Object.values(Role)
              .filter((role) => role !== Role.Superuser)
              .map((role) => (
                <div className="flex flex-row items-center" key={role}>
                  <Checkbox
                    id={role}
                    checked={user.roles.includes(role as Role)}
                    onCheckedChange={() => handleRoleChange(role as Role)}
                    disabled={assigning || revoking}
                  />
                  <label htmlFor={role} className="ml-2">
                    {formatRole(role as Role)}
                  </label>
                </div>
              ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default UserDetailsCard
