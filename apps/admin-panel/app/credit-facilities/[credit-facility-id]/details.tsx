"use client"

import React from "react"

import Link from "next/link"

import { CreditFacilityCollateralUpdateDialog } from "../collateral-update"

import { CreditFacilityApproveDialog } from "../approve"

import { CreditFacilityDisbursementInitiateDialog } from "../disbursement-Initiate"

import { GetCreditFacilityDetailsQuery } from "@/lib/graphql/generated"
import { DetailItem, DetailsGroup } from "@/components/details"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/primitive/card"
import Balance from "@/components/balance/balance"
import { formatCollateralizationState } from "@/lib/utils"

import { Button } from "@/components/primitive/button"

type CreditFacilityDetailsProps = {
  creditFacilityId: string
  creditFacilityDetails: NonNullable<GetCreditFacilityDetailsQuery["creditFacility"]>
}

const CreditFacilityDetailsCard: React.FC<CreditFacilityDetailsProps> = ({
  creditFacilityId,
  creditFacilityDetails,
}) => {
  const [openCollateralUpdateDialog, setOpenCollateralUpdateDialog] =
    React.useState(false)
  const [openDisbursementInitiateDialog, setOpenDisbursementInitiateDialog] =
    React.useState(false)
  const [openApproveDialog, setOpenApproveDialog] = React.useState(false)

  return (
    <div className="flex gap-4">
      <Card className="w-11/12">
        <>
          <CardHeader>
            <CardTitle>Credit Facility Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <DetailsGroup>
              <Link href={`/customers/${creditFacilityDetails.customer.customerId}`}>
                <DetailItem
                  hover={true}
                  label="Customer"
                  value={creditFacilityDetails.customer.email}
                />
              </Link>
              <DetailItem
                label="Credit Facility ID"
                value={creditFacilityDetails.creditFacilityId}
              />
              <DetailItem
                label="Outstanding Balance"
                valueComponent={
                  <Balance
                    amount={creditFacilityDetails.balance.outstanding.usdBalance}
                    currency="usd"
                  />
                }
              />
              <DetailItem
                label="Collateralization State"
                value={formatCollateralizationState(
                  creditFacilityDetails.collateralizationState,
                )}
              />
            </DetailsGroup>
          </CardContent>
        </>
      </Card>
      <div className="flex flex-col space-y-2 mt-1">
        {creditFacilityDetails.userCanApprove && (
          <Button
            variant="primary"
            className="w-full"
            onClick={() => setOpenApproveDialog(true)}
          >
            Approve
          </Button>
        )}
        {creditFacilityDetails.userCanUpdateCollateral && (
          <Button
            variant="primary"
            className="w-full"
            onClick={() => setOpenCollateralUpdateDialog(true)}
          >
            Collateral Update
          </Button>
        )}
        {creditFacilityDetails.userCanInitiateDisbursement && (
          <Button
            variant="primary"
            className="w-full"
            onClick={() => setOpenDisbursementInitiateDialog(true)}
          >
            Disbursement Initiate
          </Button>
        )}
      </div>

      <CreditFacilityCollateralUpdateDialog
        creditFacilityId={creditFacilityId}
        openDialog={openCollateralUpdateDialog}
        setOpenDialog={() => setOpenCollateralUpdateDialog(false)}
      />
      <CreditFacilityDisbursementInitiateDialog
        creditFacilityId={creditFacilityId}
        openDialog={openDisbursementInitiateDialog}
        setOpenDialog={() => setOpenDisbursementInitiateDialog(false)}
      />
      <CreditFacilityApproveDialog
        creditFacilityId={creditFacilityId}
        openDialog={openApproveDialog}
        setOpenDialog={() => setOpenApproveDialog(false)}
      />
    </div>
  )
}

export default CreditFacilityDetailsCard
