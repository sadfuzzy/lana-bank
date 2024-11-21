import React from "react"

import { VotersCard } from "../disbursals/[disbursal-id]/voters"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/primitive/dialog"
import Balance from "@/components/balance/balance"
import { formatDate } from "@/lib/utils"
import { DetailItem, DetailsGroup } from "@/components/details"
import { GetCreditFacilityDetailsQuery } from "@/lib/graphql/generated"

type DisbursalDetailsDialogProps = {
  setOpenDialog: (isOpen: boolean) => void
  openDialog: boolean
  disbursal: NonNullable<
    GetCreditFacilityDetailsQuery["creditFacility"]
  >["disbursals"][number]
}

export const DisbursalDetailsDialog: React.FC<DisbursalDetailsDialogProps> = ({
  setOpenDialog,
  openDialog,
  disbursal,
}) => {
  const handleCloseDialog = () => {
    setOpenDialog(false)
  }

  return (
    <Dialog open={openDialog} onOpenChange={handleCloseDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Disbursal Details</DialogTitle>
          <DialogDescription>View the details of this disbursal.</DialogDescription>
        </DialogHeader>
        <DetailsGroup>
          <DetailItem
            className="px-0"
            label="ID"
            value={disbursal.id.split("disbursal:")[1]}
          />
          <DetailItem
            className="px-0"
            label="Amount"
            value={<Balance amount={disbursal.amount} currency="usd" />}
          />
          <DetailItem
            className="px-0"
            label="Created"
            value={formatDate(disbursal.createdAt)}
          />
        </DetailsGroup>
        <VotersCard approvalProcess={disbursal.approvalProcess} />
      </DialogContent>
    </Dialog>
  )
}
