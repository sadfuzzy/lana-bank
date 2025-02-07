"use client"
import { DetailItemProps, DetailsCard } from "@lana/web/components/details"
import { Badge } from "@lana/web/ui/badge"

import React from "react"

import { useBreakpointDown } from "@lana/web/hooks"

import { AccountStatus, MeQuery } from "@/lib/graphql/generated"
import Balance from "@/components/balance"
import { formatDate } from "@/lib/utils"

function UserDetailsCard({
  customer,
  totalBalanceInCents,
}: {
  customer: NonNullable<MeQuery["me"]["customer"]>
  totalBalanceInCents: number
}) {
  const isMobile = useBreakpointDown("md")

  const details: DetailItemProps[] = [
    ...(!isMobile
      ? [
          {
            label: "Balance",
            value: <Balance amount={totalBalanceInCents} currency="usd" />,
          },
        ]
      : []),
    {
      label: "Joined on",
      value: formatDate(customer.createdAt),
    },
    {
      label: "Telegram",
      value: customer.telegramId,
    },
    {
      label: "Account Status",
      value: (
        <Badge
          variant={customer.status === AccountStatus.Active ? "success" : "secondary"}
        >
          {customer.status}
        </Badge>
      ),
    },
  ]

  return (
    <DetailsCard
      title={<div className="text-md font-semibold text-primary">{customer.email}</div>}
      details={details}
    />
  )
}

export default UserDetailsCard
