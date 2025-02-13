"use client"
import { FaBan, FaCheckCircle, FaQuestion } from "react-icons/fa"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@lana/web/ui/card"

import {
  ApprovalProcessStatus,
  GetDisbursalDetailsQuery,
  GetWithdrawalDetailsQuery,
} from "@/lib/graphql/generated"
import { formatRole } from "@/lib/utils"

export const VotersCard = ({
  approvalProcess,
}: {
  approvalProcess:
    | NonNullable<GetDisbursalDetailsQuery["disbursal"]>["approvalProcess"]
    | NonNullable<GetWithdrawalDetailsQuery["withdrawal"]>["approvalProcess"]
    | null
}) => {
  if (!approvalProcess) {
    return null
  }

  if (approvalProcess?.rules.__typename !== "CommitteeThreshold") {
    return null
  }

  return (
    <Card className="mt-2">
      <CardHeader>
        <CardTitle>
          Approval process decision from the {approvalProcess.rules.committee?.name}{" "}
          Committee
        </CardTitle>
        <CardDescription>Users who can approve the process</CardDescription>
      </CardHeader>
      <CardContent>
        {approvalProcess.voters
          .filter((voter) => {
            if (
              approvalProcess.status === ApprovalProcessStatus.InProgress ||
              ([ApprovalProcessStatus.Approved, ApprovalProcessStatus.Denied].includes(
                approvalProcess.status as ApprovalProcessStatus,
              ) &&
                voter.didVote)
            ) {
              return true
            }
            return false
          })
          .map((voter) => (
            <div key={voter.user.userId} className="flex items-center space-x-3 p-2">
              {voter.didApprove ? (
                <FaCheckCircle className="h-6 w-6 text-green-500" />
              ) : voter.didDeny ? (
                <FaBan className="h-6 w-6 text-red-500" />
              ) : !voter.didVote ? (
                <FaQuestion className="h-6 w-6 text-textColor-secondary" />
              ) : (
                <>{/* Impossible */}</>
              )}
              <div>
                <p className="text-sm font-medium">{voter.user.email}</p>
                <p className="text-sm text-textColor-secondary">
                  {voter.user.roles.map(formatRole).join(", ")}
                </p>
                {
                  <p className="text-xs text-textColor-secondary">
                    {voter.didApprove && "Approved"}
                    {voter.didDeny && "Denied"}
                    {!voter.didVote && "Has not voted yet"}
                  </p>
                }
              </div>
            </div>
          ))}
      </CardContent>
    </Card>
  )
}
