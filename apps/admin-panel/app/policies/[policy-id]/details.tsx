"use client"
import React from "react"

import { CommitteeAssignmentDialog } from "./assign-to-committee"

import { DetailsCard, DetailItemProps } from "@/components/details"
import { ApprovalRules, GetPolicyDetailsQuery } from "@/lib/graphql/generated"
import { Button } from "@/ui/button"
import { formatRule, formatProcessType } from "@/lib/utils"

type PolicyDetailsProps = {
  policy: NonNullable<GetPolicyDetailsQuery["policy"]>
}

export const PolicyDetailsCard: React.FC<PolicyDetailsProps> = ({ policy }) => {
  const [openAssignDialog, setOpenAssignDialog] = React.useState(false)
  const policyRuleType = policy.rules.__typename

  const details: DetailItemProps[] = [
    {
      label: "Process Type",
      value: formatProcessType(policy.approvalProcessType),
    },
    {
      label: "Rule",
      value: formatRule(policy.rules as ApprovalRules),
    },
    ...(policyRuleType === "CommitteeThreshold"
      ? [
          {
            label: "Assigned Committee",
            value: policy.rules.committee.name,
          },
        ]
      : []),
  ]

  const footerContent = (
    <Button
      variant="outline"
      onClick={() => setOpenAssignDialog(true)}
      data-testid="policy-assign-committee"
    >
      {policyRuleType === "CommitteeThreshold" ? "Update Policy" : "Assign Committee"}
    </Button>
  )

  return (
    <>
      <DetailsCard
        title="Policy"
        details={details}
        footerContent={footerContent}
        className="w-full"
      />

      <CommitteeAssignmentDialog
        policyId={policy.policyId}
        openAssignDialog={openAssignDialog}
        setOpenAssignDialog={setOpenAssignDialog}
      />
    </>
  )
}
