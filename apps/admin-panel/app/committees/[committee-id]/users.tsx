"use client"
import React, { useState } from "react"
import { IoTrashOutline } from "react-icons/io5"

import { Button } from "@lana/web/ui/button"

import { Badge } from "@lana/web/ui/badge"

import { RemoveUserCommitteeDialog } from "../remove-user"

import { GetCommitteeDetailsQuery } from "@/lib/graphql/generated"
import { formatRole } from "@/lib/utils"

import DataTable, { Column } from "@/components/data-table"
import CardWrapper from "@/components/card-wrapper"

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
        className="w-full md:w-auto text-destructive"
        variant="outline"
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
      <CardWrapper title="Members" description="Members in this committee">
        <DataTable
          data={committee.currentMembers}
          columns={columns}
          emptyMessage="No members found in this committee"
          navigateTo={(user) => `/users/${user.userId}/`}
        />
      </CardWrapper>

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
