import React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/primitive/card"
import { DetailItem, DetailsGroup } from "@/components/details"
import Balance from "@/components/balance/balance"

import { GetCreditFacilityDetailsQuery } from "@/lib/graphql/generated"

type CreditFacilitySnapshotProps = {
  creditFacility: NonNullable<GetCreditFacilityDetailsQuery["creditFacility"]>
}

export const CreditFacilitySnapshot: React.FC<CreditFacilitySnapshotProps> = ({
  creditFacility,
}) => {
  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Credit Facility Snapshot</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-6">
          <div className="grid auto-rows-min">
            <DetailsGroup>
              <DetailItem
                label="Collateral balance"
                valueComponent={
                  <Balance amount={creditFacility.collateral} currency="btc" />
                }
              />
            </DetailsGroup>
          </div>
          <div className="grid auto-rows-min">
            <DetailsGroup>
              <DetailItem
                label="Outstanding Balance"
                valueComponent={
                  <Balance
                    amount={creditFacility.balance.outstanding.usdBalance}
                    currency="usd"
                  />
                }
              />
            </DetailsGroup>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
