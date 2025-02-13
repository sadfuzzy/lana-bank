"use client"
import { DetailsCard } from "@lana/web/components/details"

import React from "react"

import { GetCreditFacilityLayoutDetailsQuery } from "@/lib/graphql/generated"
import Balance from "@/components/balance/balance"

function FacilityCard({
  creditFacility,
}: {
  creditFacility: NonNullable<GetCreditFacilityLayoutDetailsQuery["creditFacility"]>
}) {
  const facilityData = [
    {
      label: "Facility Amount",
      value: <Balance amount={creditFacility.facilityAmount} currency="usd" />,
    },
    {
      label: "Facility Remaining",
      value: (
        <Balance
          amount={creditFacility.balance.facilityRemaining.usdBalance}
          currency="usd"
        />
      ),
    },
    {
      label: "Outstanding Interest",
      value: (
        <Balance
          amount={creditFacility.balance.interest.outstanding.usdBalance}
          currency="usd"
        />
      ),
    },
    {
      label: "Total Outstanding Balance",
      value: (
        <Balance amount={creditFacility.balance.outstanding.usdBalance} currency="usd" />
      ),
    },
    {
      label: "Total Disbursed",
      value: (
        <Balance
          amount={creditFacility.balance.disbursed.total.usdBalance}
          currency="usd"
        />
      ),
    },
    {
      label: "Outstanding Disbursed",
      value: (
        <Balance
          amount={creditFacility.balance.disbursed.outstanding.usdBalance}
          currency="usd"
        />
      ),
    },
    {
      label: "Total Interest",
      value: (
        <Balance
          amount={creditFacility.balance.interest.total.usdBalance}
          currency="usd"
        />
      ),
    },
  ]
  return (
    <DetailsCard className="w-full" title="Facility" details={facilityData} columns={2} />
  )
}

export default FacilityCard
