"use client"

import React from "react"

import { AddUserCommitteeDialog } from "../add-user"

import { DetailsCard, DetailItemProps } from "@/components/details"
import { GetCommitteeDetailsQuery } from "@/lib/graphql/generated"
import { Button } from "@/ui/button"
import { formatDate } from "@/lib/utils"

type CommitteeDetailsProps = {
  committee: NonNullable<GetCommitteeDetailsQuery["committee"]>
}

export const CommitteeDetailsCard: React.FC<CommitteeDetailsProps> = ({ committee }) => {
  const [openAddUserDialog, setOpenAddUserDialog] = React.useState(false)

  const details: DetailItemProps[] = [
    { label: "Created At", value: formatDate(committee.createdAt) },
    { label: "Name", value: committee.name },
    { label: "Total Members", value: committee.currentMembers.length },
  ]

  const footerContent = (
    <Button
      variant="outline"
      onClick={() => setOpenAddUserDialog(true)}
      data-testid="committee-add-member-button"
    >
      Add Member
    </Button>
  )

  return (
    <>
      <DetailsCard
        title="Committee"
        details={details}
        footerContent={footerContent}
        className="w-full"
      />

      <AddUserCommitteeDialog
        committeeId={committee.committeeId}
        openAddUserDialog={openAddUserDialog}
        setOpenAddUserDialog={setOpenAddUserDialog}
      />
    </>
  )
}
