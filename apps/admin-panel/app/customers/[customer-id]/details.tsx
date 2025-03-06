"use client"

import { useState } from "react"
import { PiPencilSimpleLineLight } from "react-icons/pi"
import { useTranslations } from "next-intl"

import { Badge } from "@lana/web/ui/badge"

import UpdateTelegramIdDialog from "./update-telegram-id"

import { DetailsCard, DetailItemProps } from "@/components/details"
import {
  AccountStatus,
  CustomerType,
  GetCustomerBasicDetailsQuery,
} from "@/lib/graphql/generated"
import { formatDate } from "@/lib/utils"

type CustomerDetailsCardProps = {
  customer: NonNullable<GetCustomerBasicDetailsQuery["customer"]>
}

export const CustomerDetailsCard: React.FC<CustomerDetailsCardProps> = ({ customer }) => {
  const t = useTranslations("Customers.CustomerDetails.details")

  const [openUpdateTelegramIdDialog, setOpenUpdateTelegramIdDialog] = useState(false)

  const details: DetailItemProps[] = [
    { label: t("labels.email"), value: customer.email },
    {
      label: t("labels.customerType"),
      value:
        customer.customerType === CustomerType.Individual
          ? t("customerType.individual")
          : t("customerType.company"),
    },
    { label: t("labels.createdOn"), value: formatDate(customer.createdAt) },
    {
      label: t("labels.telegram"),
      value: (
        <button
          type="button"
          className="flex items-center gap-2"
          onClick={() => setOpenUpdateTelegramIdDialog(true)}
        >
          {customer.telegramId}
          <PiPencilSimpleLineLight className="w-5 h-5 cursor-pointer text-primary" />
        </button>
      ),
    },
    {
      label: t("labels.status"),
      value: (
        <Badge
          variant={customer.status === AccountStatus.Active ? "success" : "secondary"}
        >
          {customer.status === AccountStatus.Active
            ? t("status.active")
            : t("status.inactive")}
        </Badge>
      ),
    },
  ]

  return (
    <>
      <DetailsCard title={t("title")} details={details} className="w-full" />
      <UpdateTelegramIdDialog
        customerId={customer.customerId}
        openUpdateTelegramIdDialog={openUpdateTelegramIdDialog}
        setOpenUpdateTelegramIdDialog={() => setOpenUpdateTelegramIdDialog(false)}
      />
    </>
  )
}
