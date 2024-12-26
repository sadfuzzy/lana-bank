"use client"
import React, { useEffect } from "react"
import { gql } from "@apollo/client"

import { PolicyDetailsCard } from "./details"

import { useGetPolicyDetailsQuery } from "@/lib/graphql/generated"
import { CommitteeUsers } from "@/app/committees/[committee-id]/users"
import { useBreadcrumb } from "@/app/breadcrumb-provider"
import { formatProcessType } from "@/lib/utils"
import { DetailsPageSkeleton } from "@/components/details-page-skeleton"

gql`
  query GetPolicyDetails($id: UUID!) {
    policy(id: $id) {
      id
      policyId
      approvalProcessType
      rules {
        ... on CommitteeThreshold {
          threshold
          committee {
            ...CommitteeFields
          }
        }
        ... on SystemApproval {
          autoApprove
        }
      }
    }
  }
`

function PolicyPage({
  params,
}: {
  params: {
    "policy-id": string
  }
}) {
  const { "policy-id": policyId } = params
  const { setCustomLinks, resetToDefault } = useBreadcrumb()

  const { data, loading, error } = useGetPolicyDetailsQuery({
    variables: { id: policyId },
  })

  useEffect(() => {
    if (data?.policy) {
      setCustomLinks([
        { title: "Dashboard", href: "/dashboard" },
        { title: "Policies", href: "/policies" },
        {
          title: formatProcessType(data.policy.approvalProcessType),
          isCurrentPage: true,
        },
      ])
    }

    return () => {
      resetToDefault()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.policy])

  if (loading) {
    return <DetailsPageSkeleton tabs={0} detailItems={3} tabsCards={0} />
  }
  if (error) return <div className="text-destructive">{error.message}</div>
  if (!data?.policy) return <div>Not found</div>

  return (
    <main className="max-w-7xl m-auto">
      <PolicyDetailsCard policy={data.policy} />
      <div className="flex flex-col mt-4">
        {data.policy.rules.__typename === "CommitteeThreshold" && (
          <CommitteeUsers showRemove={false} committee={data.policy.rules.committee} />
        )}
      </div>
    </main>
  )
}

export default PolicyPage
