"use client"

import React from "react"

import Balance from "@/components/balance/balance"

import { DetailsCard, DetailItemProps } from "@/components/details"
import { GetCustomerOverviewQuery } from "@/lib/graphql/generated"

type CustomerAccountBalancesProps = {
  balance: NonNullable<GetCustomerOverviewQuery["customer"]>["balance"]
}

export const CustomerAccountBalances: React.FC<CustomerAccountBalancesProps> = ({
  balance,
}) => {
  const details: DetailItemProps[] = [
    {
      label: "Checking Settled Balance (USD)",
      value: <Balance amount={balance.checking.settled} currency="usd" />,
    },
    {
      label: "Pending Withdrawals (USD)",
      value: <Balance amount={balance.checking.pending} currency="usd" />,
    },
  ]

  return (
    <DetailsCard
      title="Account Balances"
      description="Balance Details for this Customer"
      details={details}
      className="w-1/2"
    />
  )
}
