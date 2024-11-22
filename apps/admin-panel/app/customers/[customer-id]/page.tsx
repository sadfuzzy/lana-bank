"use client"

import { gql } from "@apollo/client"
import React, { useEffect } from "react"

import { CustomerDetailsCard } from "./details"
import { CustomerAccountBalances } from "./balances"
import { CustomerTransactionsTable } from "./transactions"
import { KycStatus } from "./kyc-status"
import { Documents } from "./documents"
import { CustomerCreditFacilitiesTable } from "./credit-facilities"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tab"
import { Customer as CustomerType, useGetCustomerQuery } from "@/lib/graphql/generated"
import { useCreateContext } from "@/app/create"
import { BreadCrumbWrapper, BreadcrumbLink } from "@/components/breadcrumb-wrapper"
import { DetailsPageSkeleton } from "@/components/details-page-skeleton"

gql`
  query GetCustomer($id: UUID!) {
    customer(id: $id) {
      id
      customerId
      email
      telegramId
      status
      level
      applicantId
      subjectCanRecordDeposit
      subjectCanInitiateWithdrawal
      subjectCanCreateCreditFacility
      createdAt
      balance {
        checking {
          settled
          pending
        }
      }
      creditFacilities {
        id
        creditFacilityId
        collateralizationState
        status
        createdAt
        balance {
          collateral {
            btcBalance
          }
          outstanding {
            usdBalance
          }
        }
      }
      deposits {
        createdAt
        customerId
        depositId
        reference
        amount
      }
      withdrawals {
        status
        reference
        customerId
        createdAt
        withdrawalId
        amount
        customer {
          customerId
          email
        }
      }
      transactions @client {
        ... on Deposit {
          createdAt
          customerId
          depositId
          reference
          amount
        }
        ... on Withdrawal {
          status
          reference
          customerId
          withdrawalId
          createdAt
          amount
          customer {
            customerId
            email
          }
        }
      }
      documents {
        id
        filename
      }
    }
  }
`

const CustomerBreadcrumb = ({ customerEmail }: { customerEmail: string }) => {
  const links: BreadcrumbLink[] = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Customers", href: "/customers" },
    { title: customerEmail, isCurrentPage: true },
  ]

  return <BreadCrumbWrapper links={links} />
}

const Customer = ({
  params,
}: {
  params: {
    "customer-id": string
  }
}) => {
  const { "customer-id": customerId } = params

  const { setCustomer } = useCreateContext()
  const { data, loading, error, refetch } = useGetCustomerQuery({
    variables: { id: customerId },
  })

  useEffect(() => {
    data?.customer && setCustomer(data?.customer as CustomerType)
    return () => setCustomer(null)
  }, [data?.customer, setCustomer])

  if (loading) return <DetailsPageSkeleton detailItems={3} tabs={6} />
  if (error) return <div className="text-destructive">{error.message}</div>
  if (!data || !data.customer) return null

  return (
    <main className="max-w-7xl m-auto">
      <CustomerBreadcrumb customerEmail={data.customer.email} />
      <CustomerDetailsCard customer={data.customer} refetch={refetch} />
      <Tabs defaultValue="overview" className="mt-2">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="credit-facilities">Credit Facilities</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="docs">Documents</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <div className="flex w-full gap-2">
            <CustomerAccountBalances balance={data.customer.balance} />
            <KycStatus customerId={customerId} />
          </div>
        </TabsContent>
        <TabsContent value="credit-facilities">
          <CustomerCreditFacilitiesTable
            creditFacilities={data.customer.creditFacilities}
          />
        </TabsContent>
        <TabsContent value="transactions">
          <CustomerTransactionsTable transactions={data.customer.transactions} />
        </TabsContent>
        <TabsContent value="docs">
          <Documents customer={data.customer} refetch={refetch} />
        </TabsContent>
      </Tabs>
    </main>
  )
}

export default Customer
