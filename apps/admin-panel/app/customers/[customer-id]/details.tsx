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

import { AccountStatus, GetCustomerQuery } from "@/lib/graphql/generated"
import { ID } from "@/components/new"
import { Badge } from "@/components/primitive/badge"

type CustomerDetailsCardProps = {
  customer: NonNullable<GetCustomerQuery["customer"]>
  refetch: () => void
}

export const CustomerDetailsCard: React.FC<CustomerDetailsCardProps> = ({
  customer,
  refetch,
}) => {
  const [openUpdateTelegramIdDialog, setOpenUpdateTelegramIdDialog] = useState(false)

  return (
    <div className="flex gap-4">
      <Card className="w-full">
        <CardHeader className="flex flex-row justify-between items-center pb-4">
          <div className="flex flex-col gap-2">
            <CardTitle>Customer</CardTitle>
            <CardDescription>
              <ID id={customer.customerId} />
            </CardDescription>
          </div>
          <Badge
            variant={customer.status === AccountStatus.Active ? "success" : "secondary"}
          >
            {customer.status}
          </Badge>
        </CardHeader>
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
          </DetailsGroup>
        </CardContent>
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
