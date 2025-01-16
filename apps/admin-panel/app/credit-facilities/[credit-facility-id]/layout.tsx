"use client"

import { gql, useApolloClient } from "@apollo/client"
import { useEffect } from "react"

import CreditFacilityDetailsCard from "./details"

import { DetailsPageSkeleton } from "@/components/details-page-skeleton"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/ui/tab"
import { useTabNavigation } from "@/hooks/use-tab-navigation"

import {
  ApprovalProcessStatus,
  CreditFacility,
  CreditFacilityStatus,
  GetCreditFacilityBasicDetailsDocument,
  GetCreditFacilityOverviewDocument,
  GetCreditFacilityTransactionsDocument,
  useGetCreditFacilityBasicDetailsQuery,
} from "@/lib/graphql/generated"
import { useBreadcrumb } from "@/app/breadcrumb-provider"
import { useCreateContext } from "@/app/create"

gql`
  fragment CreditFacilityBasicDetailsFragment on CreditFacility {
    id
    creditFacilityId
    status
    facilityAmount
    collateralizationState
    customer {
      customerId
      email
    }
    approvalProcess {
      id
      deniedReason
      status
      subjectCanSubmitDecision
      approvalProcessId
      approvalProcessType
      createdAt
    }
    subjectCanUpdateCollateral
    subjectCanInitiateDisbursal
    subjectCanRecordPayment
    subjectCanComplete
  }

  query GetCreditFacilityBasicDetails($id: UUID!) {
    creditFacility(id: $id) {
      ...CreditFacilityBasicDetailsFragment
    }
  }
`

const TABS = [
  { id: "1", url: "/", tabLabel: "Overview" },
  { id: "2", url: "/terms", tabLabel: "Terms" },
  { id: "3", url: "/transactions", tabLabel: "Transactions" },
  { id: "4", url: "/disbursals", tabLabel: "Disbursals" },
]

export default function CreditFacilityLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { "credit-facility-id": string }
}) {
  const { "credit-facility-id": creditFacilityId } = params
  const { currentTab, handleTabChange } = useTabNavigation(TABS, creditFacilityId)
  const { setCustomLinks, resetToDefault } = useBreadcrumb()
  const client = useApolloClient()
  const { setFacility } = useCreateContext()

  const { data, loading, error, refetch } = useGetCreditFacilityBasicDetailsQuery({
    variables: { id: creditFacilityId },
    fetchPolicy: "cache-and-network",
  })

  useEffect(() => {
    data?.creditFacility && setFacility(data?.creditFacility as CreditFacility)
    return () => setFacility(null)
  }, [data?.creditFacility, setFacility])

  useEffect(() => {
    if (
      data?.creditFacility?.status === CreditFacilityStatus.PendingApproval &&
      data?.creditFacility?.approvalProcess?.status === ApprovalProcessStatus.Approved
    ) {
      const timer = setInterval(() => {
        client.query({
          query: GetCreditFacilityBasicDetailsDocument,
          variables: { id: creditFacilityId },
          fetchPolicy: "network-only",
        })
        client.query({
          query: GetCreditFacilityOverviewDocument,
          variables: { id: creditFacilityId },
          fetchPolicy: "network-only",
        })
        client.query({
          query: GetCreditFacilityTransactionsDocument,
          variables: { id: creditFacilityId },
          fetchPolicy: "network-only",
        })
      }, 3000)

      return () => clearInterval(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.creditFacility?.status, data?.creditFacility?.approvalProcess?.status])

  useEffect(() => {
    if (data?.creditFacility) {
      const currentTabData = TABS.find((tab) => tab.url === currentTab)
      setCustomLinks([
        { title: "Dashboard", href: "/dashboard" },
        { title: "Credit Facilities", href: "/credit-facilities" },
        {
          title: data.creditFacility.creditFacilityId,
          href: `/credit-facilities/${creditFacilityId}`,
        },
        ...(currentTabData?.url === "/"
          ? []
          : [{ title: currentTabData?.tabLabel ?? "", isCurrentPage: true as const }]),
      ])
    }
    return () => {
      resetToDefault()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.creditFacility, currentTab])

  if (loading && !data) return <DetailsPageSkeleton detailItems={4} tabs={4} />
  if (error) return <div className="text-destructive">{error.message}</div>
  if (!data?.creditFacility) return <div>Not found</div>

  return (
    <main className="max-w-7xl m-auto">
      <CreditFacilityDetailsCard
        creditFacilityId={creditFacilityId}
        creditFacilityDetails={data.creditFacility}
        refetch={refetch}
      />
      <Tabs
        defaultValue={TABS[0].url}
        value={currentTab}
        onValueChange={handleTabChange}
        className="mt-2"
      >
        <TabsList>
          {TABS.map((tab) => (
            <TabsTrigger key={tab.url} value={tab.url}>
              {tab.tabLabel}
            </TabsTrigger>
          ))}
        </TabsList>
        {TABS.map((tab) => (
          <TabsContent key={tab.url} value={tab.url}>
            {children}
          </TabsContent>
        ))}
      </Tabs>
    </main>
  )
}
