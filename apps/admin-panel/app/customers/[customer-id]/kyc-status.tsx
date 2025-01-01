"use client"

import React from "react"
import { gql } from "@apollo/client"
import { HiLink } from "react-icons/hi"

import { Copy } from "lucide-react"

import { toast } from "sonner"

import {
  useGetKycStatusForCustomerQuery,
  useSumsubPermalinkCreateMutation,
} from "@/lib/graphql/generated"
import { DetailsCard, DetailItemProps } from "@/components/details"
import { Skeleton } from "@/ui/skeleton"
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

  const details: DetailItemProps[] = [
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
              data-testid="customer-create-kyc-link"
            >
              <HiLink />
              {linkLoading ? "creating link..." : "Create link"}
            </button>
          )}
          {linkData && linkData.sumsubPermalinkCreate && (
            <div className="flex items-center gap-2">
              <a
                href={linkData.sumsubPermalinkCreate.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 underline overflow-hidden text-ellipsis whitespace-nowrap max-w-[200px]"
              >
                {linkData.sumsubPermalinkCreate.url}
              </a>
              <Copy
                className="h-4 w-4 cursor-pointer"
                onClick={() => {
                  navigator.clipboard.writeText(linkData.sumsubPermalinkCreate.url)
                  toast.success("Copied to clipboard")
                }}
              />
            </div>
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
      className="w-full md:w-1/2"
    />
  )
}
