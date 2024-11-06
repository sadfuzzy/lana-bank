"use client"

import { useState } from "react"
import { PiPencilSimpleLineLight } from "react-icons/pi"

import UpdateTelegramIdDialog from "./update-telegram-id"

import { DetailItem, DetailsGroup } from "@/components/details"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/primitive/card"

import { GetCustomerQuery } from "@/lib/graphql/generated"
import { ID } from "@/components/new"

type CustomerDetailsCardProps = {
  customer: NonNullable<GetCustomerQuery["customer"]>
  refetch: () => void
}

export const CustomerDetailsCard: React.FC<CustomerDetailsCardProps> = ({
  customer,
  refetch,
}) => {
  const [openWithdrawalInitiateDialog, setOpenWithdrawalInitiateDialog] = useState(false)
  const [openRecordDepositDialog, setOpenRecordDepositDialog] = useState(false)
  const [openUpdateTelegramIdDialog, setOpenUpdateTelegramIdDialog] = useState(false)
  const [openCreateCreditFacilityDialog, setOpenCreateCreditFacilityDialog] =
    useState(false)

  return (
    <div className="flex gap-4">
      <Card className="w-full">
        <CardHeader className="pb-4">
          <CardTitle>Customer</CardTitle>
          <CardDescription>
            <ID id={customer.customerId} />
          </CardDescription>
        </CardHeader>
        <div className="flex w-full items-center justify-between">
          <CardContent className="flex-1">
            <DetailsGroup>
              <DetailItem label="Email" value={customer.email} />
              <DetailItem
                label="Telegram"
                value={
                  <div className="flex items-center gap-2">
                    {customer.telegramId}
                    <PiPencilSimpleLineLight
                      onClick={() => setOpenUpdateTelegramIdDialog(true)}
                      className="w-5 h-5 cursor-pointer text-primary"
                    />
                  </div>
                }
              />
              <DetailItem label="Status" value={customer.status} />
            </DetailsGroup>
          </CardContent>
        </div>
      </Card>
      <UpdateTelegramIdDialog
        customerId={customer.customerId}
        openUpdateTelegramIdDialog={openUpdateTelegramIdDialog}
        setOpenUpdateTelegramIdDialog={() => setOpenUpdateTelegramIdDialog(false)}
        refetch={refetch}
      />
    </div>
  )
}
