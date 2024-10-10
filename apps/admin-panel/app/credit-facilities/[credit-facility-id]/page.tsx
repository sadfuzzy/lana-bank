"use client"

import React from "react"
import { gql } from "@apollo/client"

import CreditFacilityDetailsCard from "./details"

import { CreditFacilitySnapshot } from "./snapshot"

import { CreditFacilityTerms } from "./terms"

import { CreditFacilityApprovers } from "./approvers"

import { CreditFacilityDisbursements } from "./disbursements"

import { PageHeading } from "@/components/page-heading"
import { useGetCreditFacilityDetailsQuery } from "@/lib/graphql/generated"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/primitive/tab"

gql`
  query GetCreditFacilityDetails($id: UUID!) {
    creditFacility(id: $id) {
      id
      creditFacilityId
      collateralizationState
      status
      faciiltyAmount
      collateral
      createdAt
      expiresAt
      canBeCompleted
      balance {
        outstanding {
          usdBalance
        }
        collateral {
          btcBalance
        }
      }
      customer {
        customerId
        email
        telegramId
        status
        level
        applicantId
      }
      creditFacilityTerms {
        annualRate
        interval
        liquidationCvl
        marginCallCvl
        initialCvl
        duration {
          period
          units
        }
      }
      approvals {
        user {
          roles
          email
          userId
        }
        approvedAt
      }
      disbursements {
        id
        index
        amount
        status
      }
      userCanApprove
      userCanUpdateCollateral
      userCanInitiateDisbursement
      userCanApproveDisbursement
      userCanRecordPayment
      userCanComplete
    }
  }
`

function CreditFacilityPage({
  params,
}: {
  params: {
    "credit-facility-id": string
  }
}) {
  const { "credit-facility-id": creditFacilityId } = params
  const { data, loading, error } = useGetCreditFacilityDetailsQuery({
    variables: { id: creditFacilityId },
  })

  if (loading) return <p>Loading...</p>
  if (error) return <div className="text-destructive">{error.message}</div>
  if (!data?.creditFacility) return <div>Not found</div>

  const hasApprovers = !!data?.creditFacility?.approvals?.length

  return (
    <main className="max-w-7xl m-auto">
      <PageHeading>Credit Facility Details</PageHeading>
      <CreditFacilityDetailsCard
        creditFacilityId={creditFacilityId}
        creditFacilityDetails={data.creditFacility}
      />
      <Tabs defaultValue="overview" className="mt-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="snapshot">Snapshot</TabsTrigger>
          <TabsTrigger value="terms">Terms</TabsTrigger>
          {data.creditFacility.disbursements.length > 0 && (
            <TabsTrigger value="disbursements">Disbursements</TabsTrigger>
          )}
          {hasApprovers && <TabsTrigger value="approvers">Approvers</TabsTrigger>}
        </TabsList>
        <TabsContent value="overview">
          <CreditFacilitySnapshot creditFacility={data.creditFacility} />
          <CreditFacilityTerms creditFacility={data.creditFacility} />
          {data.creditFacility.disbursements.length > 0 && (
            <CreditFacilityDisbursements creditFacility={data.creditFacility} />
          )}
        </TabsContent>
        <TabsContent value="snapshot">
          <CreditFacilitySnapshot creditFacility={data.creditFacility} />
        </TabsContent>
        <TabsContent value="terms">
          <CreditFacilityTerms creditFacility={data.creditFacility} />
        </TabsContent>
        {data.creditFacility.disbursements.length > 0 && (
          <TabsContent value="disbursements">
            <CreditFacilityDisbursements creditFacility={data.creditFacility} />
          </TabsContent>
        )}
        {hasApprovers && (
          <TabsContent value="approvers">
            <CreditFacilityApprovers creditFacility={data.creditFacility} />
          </TabsContent>
        )}
      </Tabs>
    </main>
  )
}

export default CreditFacilityPage
