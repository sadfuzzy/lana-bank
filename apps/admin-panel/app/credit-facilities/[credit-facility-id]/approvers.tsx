import React from "react"
import { FaCheckCircle } from "react-icons/fa"

import { Card } from "@/components/primitive/card"

import { GetCreditFacilityDetailsQuery } from "@/lib/graphql/generated"
import { formatDate, formatRole } from "@/lib/utils"

type CreditFacilityApproverProps = {
  approval: NonNullable<
    NonNullable<GetCreditFacilityDetailsQuery["creditFacility"]>["approvals"]
  >[0]
}

const CreditFacilityApprover: React.FC<CreditFacilityApproverProps> = ({ approval }) => (
  <Card className="flex items-center space-x-3 p-4 mt-4">
    <FaCheckCircle className="h-8 w-8 text-green-500" />
    <div>
      <p className="text-sm font-medium">{approval.user.email}</p>
      <p className="text-sm text-textColor-secondary">
        {approval.user.roles.map(formatRole).join(", ")}
      </p>
      <p className="mt-1 text-xs text-textColor-secondary">
        Approved on {formatDate(approval.approvedAt)}
      </p>
    </div>
  </Card>
)

type CreditFacilityApproversProps = {
  creditFacility: NonNullable<GetCreditFacilityDetailsQuery["creditFacility"]>
}

export const CreditFacilityApprovers: React.FC<CreditFacilityApproversProps> = ({
  creditFacility,
}) => {
  return (
    <>
      {creditFacility.approvals.map((approval) => (
        <CreditFacilityApprover key={approval.approvedAt} approval={approval} />
      ))}
    </>
  )
}
