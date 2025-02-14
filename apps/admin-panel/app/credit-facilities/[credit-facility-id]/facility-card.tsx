"use client"
import { DetailsCard } from "@lana/web/components/details"
import React from "react"

import BigNumber from "bignumber.js"

import { GetCreditFacilityLayoutDetailsQuery } from "@/lib/graphql/generated"
import Balance from "@/components/balance/balance"
import { SignedUsdCents } from "@/types"

function calculateTotalCostInCents(
  creditFacility: NonNullable<GetCreditFacilityLayoutDetailsQuery["creditFacility"]>,
): number {
  const feeRateBN = new BigNumber(
    creditFacility.creditFacilityTerms.oneTimeFeeRate ?? 0,
  ).div(100)

  const facilityAmountCentsBN = new BigNumber(creditFacility.facilityAmount ?? 0)
  const oneTimeFeeCentsBN = facilityAmountCentsBN.multipliedBy(feeRateBN)
  const totalInterestCentsBN = new BigNumber(
    creditFacility.balance.interest.total.usdBalance ?? 0,
  )
  const totalCostCentsBN = totalInterestCentsBN.plus(oneTimeFeeCentsBN)
  return totalCostCentsBN.toNumber()
}

function FacilityCard({
  creditFacility,
}: {
  creditFacility: NonNullable<GetCreditFacilityLayoutDetailsQuery["creditFacility"]>
}) {
  const totalCostUsd = calculateTotalCostInCents(creditFacility)
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
      label: "Disbursed and Outstanding",
      value: (
        <Balance
          amount={creditFacility.balance.disbursed.outstanding.usdBalance}
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
      label: "Total Outstanding",
      value: (
        <Balance amount={creditFacility.balance.outstanding.usdBalance} currency="usd" />
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
      label: "Total Cost",
      value: <Balance amount={totalCostUsd as SignedUsdCents} currency="usd" />,
    },
  ]

  return (
    <DetailsCard className="w-full" title="Facility" details={facilityData} columns={2} />
  )
}

export default FacilityCard
