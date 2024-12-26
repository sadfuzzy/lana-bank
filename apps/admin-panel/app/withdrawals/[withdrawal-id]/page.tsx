"use client"
import { gql } from "@apollo/client"

import WithdrawalDetailsCard from "./details"

import { useGetWithdrawalDetailsQuery } from "@/lib/graphql/generated"
import { DetailsPageSkeleton } from "@/components/details-page-skeleton"

gql`
  fragment WithdrawDetailsPageFragment on Withdrawal {
    id
    customerId
    withdrawalId
    amount
    status
    reference
    subjectCanConfirm
    subjectCanCancel
    customer {
      id
      customerId
      applicantId
      email
      balance {
        checking {
          settled
          pending
        }
      }
    }
    approvalProcess {
      id
      approvalProcessId
      deniedReason
      approvalProcessType
      createdAt
      subjectCanSubmitDecision
      status
      rules {
        ... on CommitteeThreshold {
          threshold
          committee {
            name
            currentMembers {
              email
              roles
            }
          }
        }
        ... on SystemApproval {
          autoApprove
        }
      }
      voters {
        stillEligible
        didVote
        didApprove
        didDeny
        user {
          userId
          email
          roles
        }
      }
    }
  }

  query GetWithdrawalDetails($id: UUID!) {
    withdrawal(id: $id) {
      ...WithdrawDetailsPageFragment
    }
  }
`

function WithdrawalPage({
  params,
}: {
  params: {
    "withdrawal-id": string
  }
}) {
  const { "withdrawal-id": withdrawalId } = params
  const { data, loading, error, refetch } = useGetWithdrawalDetailsQuery({
    variables: { id: withdrawalId },
  })

  if (loading) {
    return <DetailsPageSkeleton tabs={0} tabsCards={0} />
  }
  if (error) return <div className="text-destructive">{error.message}</div>
  if (!data?.withdrawal) return <div>Not found</div>

  return (
    <main className="max-w-7xl m-auto">
      <WithdrawalDetailsCard withdrawal={data.withdrawal} refetch={refetch} />
    </main>
  )
}

export default WithdrawalPage
