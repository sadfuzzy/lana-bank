"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"

import { LoanAndCreditFacilityStatusBadge } from "../status-badge"
import { LoanPartialPaymentDialog } from "../partial-payment"
import { LoanApproveDialog } from "../approve"
import { CollateralUpdateDialog } from "../update-collateral"
import { CollateralizationStateUpdateDialog } from "../update-collateralization-state"

import { DetailItem, DetailsGroup } from "@/components/details"
import { Button } from "@/components/primitive/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/primitive/card"
import Balance from "@/components/balance/balance"

import {
  GetLoanDetailsQuery,
  Loan,
  LoanCollaterizationState,
  LoanStatus,
} from "@/lib/graphql/generated"
import { formatCollateralizationState } from "@/lib/utils"

type LoanDetailsCardProps = {
  loan: NonNullable<GetLoanDetailsQuery["loan"]>
  refetch: () => void
}

export const LoanDetailsCard: React.FC<LoanDetailsCardProps> = ({ loan, refetch }) => {
  const [openCollateralizationStateDialog, setOpenCollateralizationStateDialog] =
    useState(false)
  const [openCollateralUpdateDialog, setOpenCollateralUpdateDialog] = useState(false)

  const router = useRouter()

  return (
    <div className="flex">
      <Card className="w-full">
        <>
          <CardHeader className="flex-row justify-between items-center">
            <CardTitle>Loan</CardTitle>
            <LoanAndCreditFacilityStatusBadge status={loan.status} />
          </CardHeader>
          <CardContent className="flex-1">
            <DetailsGroup>
              <DetailItem label="Loan ID" value={loan.loanId} />
              <DetailItem
                label="Customer Email"
                value={loan.customer.email}
                onClick={() => {
                  router.push(`/customers/${loan.customer.customerId}`)
                }}
              />
              <DetailItem
                label="Principal"
                value={<Balance amount={loan.principal} currency="usd" />}
              />
              <DetailItem
                label="Collaterization State"
                value={formatCollateralizationState(loan.collateralizationState)}
              />
            </DetailsGroup>
          </CardContent>
        </>
      </Card>
      <div className="flex flex-col space-y-2 mt-1 ml-4">
        {loan.subjectCanUpdateCollateral && loan.status !== LoanStatus.Closed && (
          <Button onClick={() => setOpenCollateralUpdateDialog(true)}>
            Update Collateral
          </Button>
        )}
        {loan.subjectCanRecordPaymentOrCompleteLoan &&
          loan.status === LoanStatus.Active && (
            <LoanPartialPaymentDialog refetch={refetch} loanId={loan.loanId}>
              <Button>Make Payment</Button>
            </LoanPartialPaymentDialog>
          )}
        {loan.subjectCanApprove && loan.status === LoanStatus.New && (
          <LoanApproveDialog refetch={refetch} loanDetails={loan as Loan}>
            <Button>Approve Loan</Button>
          </LoanApproveDialog>
        )}
        {loan.subjectCanUpdateCollateralizationState &&
          loan.status === LoanStatus.Active &&
          loan.collateralizationState ===
            LoanCollaterizationState.UnderLiquidationThreshold && (
            <Button onClick={() => setOpenCollateralizationStateDialog(true)}>
              Update Collateralization
            </Button>
          )}
      </div>
      <>
        <CollateralUpdateDialog
          setOpenCollateralUpdateDialog={setOpenCollateralUpdateDialog}
          openCollateralUpdateDialog={openCollateralUpdateDialog}
          loanData={{
            loanId: loan.loanId,
            existingCollateral: loan.balance.collateral.btcBalance,
          }}
          refetch={refetch}
        />
        <CollateralizationStateUpdateDialog
          setOpenDialog={setOpenCollateralizationStateDialog}
          openDialog={openCollateralizationStateDialog}
          loanData={{
            loanId: loan.loanId,
            currentState: formatCollateralizationState(loan?.collateralizationState),
          }}
          refetch={refetch}
        />
      </>
    </div>
  )
}
