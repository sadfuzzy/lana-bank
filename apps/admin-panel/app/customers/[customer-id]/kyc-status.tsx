"use client"

import React from "react"
import { gql } from "@apollo/client"
import { HiLink } from "react-icons/hi"

import {
  useGetKycStatusForCustomerQuery,
  useSumsubPermalinkCreateMutation,
} from "@/lib/graphql/generated"
import DetailsCard, { DetailItemType } from "@/components/details-card"
import { Skeleton } from "@/components/primitive/skeleton"
import { removeUnderscore } from "@/lib/utils"

gql`
  query GetKycStatusForCustomer($id: UUID!) {
    customer(id: $id) {
      customerId
      status
      level
      applicantId
    }
  }

  mutation sumsubPermalinkCreate($input: SumsubPermalinkCreateInput!) {
    sumsubPermalinkCreate(input: $input) {
      url
    }
  }
`

type KycStatusProps = {
  customerId: string
}

export const KycStatus: React.FC<KycStatusProps> = ({ customerId }) => {
  const { data, loading } = useGetKycStatusForCustomerQuery({
    variables: {
      id: customerId,
    },
  })

  const sumsubLink = `https://cockpit.sumsub.com/checkus#/applicant/${data?.customer?.applicantId}/client/basicInfo`

  const [createLink, { data: linkData, loading: linkLoading, error: linkError }] =
    useSumsubPermalinkCreateMutation()

  const handleCreateLink = async () => {
    if (data?.customer?.customerId) {
      await createLink({
        variables: {
          input: {
            customerId: data.customer.customerId,
          },
        },
      })
    }
  }

  if (loading) return <Skeleton />

  const details: DetailItemType[] = [
    {
      label: "Level",
      value: removeUnderscore(data?.customer?.level),
    },
    {
      label: "KYC Application Link",
      value: data?.customer?.applicantId ? (
        <a
          href={sumsubLink}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 underline"
        >
          {data?.customer.applicantId}
        </a>
      ) : (
        <div>
          {!linkData && (
            <button
              onClick={handleCreateLink}
              className="text-blue-500 flex gap-1 items-center"
              disabled={linkLoading}
            >
              <HiLink />
              {linkLoading ? "creating link..." : "Create link"}
            </button>
          )}
          {linkData && linkData.sumsubPermalinkCreate && (
            <a
              href={linkData.sumsubPermalinkCreate.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 underline"
            >
              {linkData.sumsubPermalinkCreate.url}
            </a>
          )}
          {linkError && <p className="text-red-500">{linkError.message}</p>}
        </div>
      ),
    },
  ]

  return (
    <DetailsCard
      title="KYC Status"
      description="KYC Details for this customer"
      details={details}
      className="w-1/2"
    />
  )
}
