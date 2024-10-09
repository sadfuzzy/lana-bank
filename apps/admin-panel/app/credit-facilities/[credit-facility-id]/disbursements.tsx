import React from "react"

import { IoCheckmark, IoCheckmarkDone } from "react-icons/io5"

import { CreditFacilityDisbursementApproveDialog } from "../disbursement-approve"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/primitive/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/primitive/card"

import {
  DisbursementStatus,
  GetCreditFacilityDetailsQuery,
} from "@/lib/graphql/generated"

import { Button } from "@/components/primitive/button"
import Balance from "@/components/balance/balance"

type CreditFacilityDisbursementsProps = {
  creditFacility: NonNullable<GetCreditFacilityDetailsQuery["creditFacility"]>
}
export const CreditFacilityDisbursements: React.FC<CreditFacilityDisbursementsProps> = ({
  creditFacility,
}) => {
  const [openApproveDialog, setOpenApproveDialog] = React.useState<number | null>(null)

  return (
    <>
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Disbursements</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Index</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead className="text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {creditFacility.disbursements.map((disbursement) => (
                <TableRow key={disbursement.id}>
                  <TableCell>{disbursement.id.split("disbursement:")[1]}</TableCell>
                  <TableCell>{disbursement.index}</TableCell>
                  <TableCell>
                    <Balance amount={disbursement.amount} currency="usd" />
                  </TableCell>
                  <TableCell className="text-right">
                    {disbursement.status === DisbursementStatus.New ? (
                      <Button
                        className="px-2 py-1 text-primary"
                        variant="ghost"
                        onClick={() => setOpenApproveDialog(disbursement.index)}
                      >
                        <IoCheckmark className="h-4 w-4 mr-1" /> Approve
                      </Button>
                    ) : (
                      <Button
                        className="px-2 py-1 text-success hover:cursor-default"
                        variant="transparent"
                      >
                        <IoCheckmarkDone className="h-4 w-4 mr-1" /> Approved
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {openApproveDialog && (
        <CreditFacilityDisbursementApproveDialog
          setOpenDialog={() => setOpenApproveDialog(null)}
          openDialog={Boolean(openApproveDialog)}
          creditFacilityId={creditFacility.creditFacilityId}
          disbursementIdx={openApproveDialog}
        />
      )}
    </>
  )
}
