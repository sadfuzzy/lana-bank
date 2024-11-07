"use client"
import React from "react"
import { gql } from "@apollo/client"

import TermsTemplateDetailsCard from "./details"

import { BreadcrumbLink, BreadCrumbWrapper } from "@/components/breadcrumb-wrapper"
import { useTermsTemplateQuery } from "@/lib/graphql/generated"
import { DetailsPageSkeleton } from "@/components/details-page-skeleton"

gql`
  query TermsTemplate($id: UUID!) {
    termsTemplate(id: $id) {
      id
      name
      termsId
      createdAt
      subjectCanUpdateTermsTemplate
      values {
        duration {
          units
          period
        }
        accrualInterval
        incurrenceInterval
        annualRate
        initialCvl
        marginCallCvl
        liquidationCvl
      }
    }
  }
`

const TermsTemplateBreadcrumb = ({ name }: { name: string }) => {
  const links: BreadcrumbLink[] = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Terms Templates", href: "/terms-templates" },
    { title: name, isCurrentPage: true },
  ]

  return <BreadCrumbWrapper links={links} />
}

function TermsTemplatePage({
  params,
}: {
  params: {
    "terms-template-id": string
  }
}) {
  const { "terms-template-id": termsTemplateId } = params
  const { data, loading, error, refetch } = useTermsTemplateQuery({
    variables: { id: termsTemplateId },
  })

  if (loading) return <DetailsPageSkeleton tabs={0} detailItems={8} tabsCards={0} />
  if (error) return <div className="text-destructive">{error.message}</div>
  if (!data?.termsTemplate) return <div>Not found</div>

  return (
    <main className="max-w-7xl m-auto">
      <TermsTemplateBreadcrumb name={data.termsTemplate.name} />
      <TermsTemplateDetailsCard termsTemplate={data.termsTemplate} refetch={refetch} />
    </main>
  )
}

export default TermsTemplatePage
