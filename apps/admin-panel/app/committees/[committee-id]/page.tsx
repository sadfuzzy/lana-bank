"use client"

import React from "react"
import { gql } from "@apollo/client"

import { CommitteeDetailsCard } from "./details"
import { CommitteeUsers } from "./users"

import { useGetCommitteeDetailsQuery } from "@/lib/graphql/generated"

import { BreadcrumbLink, BreadCrumbWrapper } from "@/components/breadcrumb-wrapper"
import { DetailsPageSkeleton } from "@/components/details-page-skeleton"

gql`
  query GetCommitteeDetails($id: UUID!) {
    committee(id: $id) {
      id
      committeeId
      createdAt
      name
      currentMembers {
        userId
        email
        roles
      }
    }
  }
`

const CommitteeBreadcrumb = ({ committeeName }: { committeeName: string }) => {
  const links: BreadcrumbLink[] = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Committees", href: "/committees" },
    { title: committeeName, isCurrentPage: true },
  ]

  return <BreadCrumbWrapper links={links} />
}

function CommitteePage({
  params,
}: {
  params: {
    "committee-id": string
  }
}) {
  const { "committee-id": committeeId } = params
  const { data, loading, error } = useGetCommitteeDetailsQuery({
    variables: { id: committeeId },
  })

  if (loading) {
    return <DetailsPageSkeleton tabs={0} detailItems={3} tabsCards={1} />
  }
  if (error) return <div className="text-destructive">{error.message}</div>
  if (!data?.committee) return <div>Not found</div>

  return (
    <main className="max-w-7xl m-auto">
      <CommitteeBreadcrumb committeeName={data.committee.name} />
      <CommitteeDetailsCard committee={data.committee} />
      <div className="mt-2">
        <CommitteeUsers committee={data.committee} />
      </div>
    </main>
  )
}

export default CommitteePage
