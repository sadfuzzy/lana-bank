import React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/primitive/card"
import { DetailItem, DetailsGroup } from "@/components/details"

import { GetLoanDetailsQuery } from "@/lib/graphql/generated"
import { formatDate, formatInterval, formatPeriod } from "@/lib/utils"

type LoanTermsProps = {
  loan: NonNullable<GetLoanDetailsQuery["loan"]>
}

export const LoanTerms: React.FC<LoanTermsProps> = ({ loan }) => {
  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Terms</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-6">
          <div className="grid auto-rows-min">
            <DetailsGroup>
              <DetailItem
                label="Duration"
                value={`${loan.loanTerms.duration.units} ${formatPeriod(loan.loanTerms.duration.period)}`}
              />
              <DetailItem
                label="Interest (APR)"
                value={`${loan.loanTerms.annualRate}%`}
              />
              <DetailItem
                label="Payment due"
                value={formatInterval(loan.loanTerms.interval)}
              />
            </DetailsGroup>
          </div>
          <div className="grid auto-rows-min">
            <DetailsGroup>
              <DetailItem
                label="Target/initial CVL %"
                value={`${loan.loanTerms.initialCvl}%`}
              />
              <DetailItem
                label="Margin call CVL %"
                value={`${loan.loanTerms.marginCallCvl}%`}
              />
              <DetailItem
                label="Liquidation CVL %"
                value={`${loan.loanTerms.liquidationCvl}%`}
              />
            </DetailsGroup>
          </div>
          <div className="grid auto-rows-min">
            <DetailsGroup>
              <DetailItem label="Date created" value={formatDate(loan.createdAt)} />
              <DetailItem
                label="Date approved"
                value={loan.approvedAt ? formatDate(loan.approvedAt) : "n/a"}
              />
              <DetailItem
                label="Term ends"
                value={loan.expiresAt ? formatDate(loan.expiresAt) : "n/a"}
              />
            </DetailsGroup>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
