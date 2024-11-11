"use client"
import React, { useState } from "react"
import { IoTrashOutline } from "react-icons/io5"

import { useRouter } from "next/navigation"

import { RemoveUserCommitteeDialog } from "../remove-user"

import { GetCommitteeDetailsQuery } from "@/lib/graphql/generated"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/primitive/card"
import { Button } from "@/components/primitive/button"
import { formatRole } from "@/lib/utils"
import { Badge } from "@/components/primitive/badge"
import DataTable, { Column } from "@/app/data-table"

type CommitteeUsersProps = {
  committee: NonNullable<GetCommitteeDetailsQuery["committee"]>
  showRemove?: boolean
}

type UserToRemove = {
  userId: string
  email: string
} | null

type CommitteeMember = NonNullable<
  GetCommitteeDetailsQuery["committee"]
>["currentMembers"][number]

export const CommitteeUsers: React.FC<CommitteeUsersProps> = ({
  committee,
  showRemove = true,
}) => {
  const [userToRemove, setUserToRemove] = useState<UserToRemove>(null)
  const router = useRouter()
  const baseColumns: Column<CommitteeMember>[] = [
    {
      key: "email",
      header: "Email",
    },

    {
      key: "roles",
      header: "",
      render: (roles) => (
        <div className="flex flex-wrap gap-2 text-textColor-secondary items-center">
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

  const removeColumn: Column<CommitteeMember> = {
    key: "userId",
    header: "",
    align: "right",
    render: (_, user) => (
      <Button
        className="gap-2 text-destructive px-1"
        variant="ghost"
        onClick={(e) => {
          e.stopPropagation()
          setUserToRemove({
            userId: user.userId,
            email: user.email,
          })
        }}
      >
        <IoTrashOutline className="w-4 h-4" />
        Remove member
      </Button>
    ),
  }

  const columns = showRemove ? [...baseColumns, removeColumn] : baseColumns

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Committee Members</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={committee.currentMembers}
            columns={columns}
            emptyMessage="No members found in this committee"
            onRowClick={(user) => {
              router.push(`/users/${user.userId}/`)
            }}
          />
        </CardContent>
      </Card>

      {userToRemove && (
        <RemoveUserCommitteeDialog
          committeeId={committee.committeeId}
          userId={userToRemove.userId}
          userEmail={userToRemove.email}
          openRemoveUserDialog={Boolean(userToRemove)}
          setOpenRemoveUserDialog={() => setUserToRemove(null)}
        />
      )}
    </>
  )
}
