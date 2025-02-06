import { DetailsCard } from "@lana/web/components/details"

import React from "react"

import Balance from "@/components/balance"
import { CreditFacility } from "@/lib/graphql/generated"

function FacilityCard({ data }: { data: NonNullable<CreditFacility> }) {
  const facilityData = [
    {
      label: "Facility Amount",
      value: <Balance amount={data.facilityAmount} currency="usd" />,
    },
    {
      label: "Facility Remaining",
      value: (
        <Balance amount={data.balance.facilityRemaining.usdBalance} currency="usd" />
      ),
    },
    {
      label: "Outstanding Interest",
      value: (
        <Balance amount={data.balance.interest.outstanding.usdBalance} currency="usd" />
      ),
    },
    // {
    //   label: "Total Outstanding",
    //   value: <Balance amount={data.balance.outstanding.usdBalance} currency="usd" />,
    // },
    // { label: "Total Cost", value:},
  ]
  return (
    <DetailsCard className="w-full" title="Facility" details={facilityData} columns={2} />
  )
}

export default FacilityCard
