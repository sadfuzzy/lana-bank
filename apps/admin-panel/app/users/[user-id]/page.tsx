"use client"
import React from "react"
import { gql } from "@apollo/client"

import UserDetailsCard from "./details"

import { BreadcrumbLink, BreadCrumbWrapper } from "@/components/breadcrumb-wrapper"
import { useGetUserDetailsQuery } from "@/lib/graphql/generated"
import { DetailsPageSkeleton } from "@/components/details-page-skeleton"

gql`
  query GetUserDetails($id: UUID!) {
    user(id: $id) {
      userId
      email
      roles
    }
  }
`

const UserBreadcrumb = ({ userEmail }: { userEmail: string }) => {
  const links: BreadcrumbLink[] = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Users", href: "/users" },
    { title: userEmail, isCurrentPage: true },
  ]

  return <BreadCrumbWrapper links={links} />
}

function UserPage({
  params,
}: {
  params: {
    "user-id": string
  }
}) {
  const { "user-id": userId } = params
  const { data, loading, error, refetch } = useGetUserDetailsQuery({
    variables: { id: userId },
  })

  if (loading) {
    return <DetailsPageSkeleton tabs={0} tabsCards={0} />
  }
  if (error) return <div className="text-destructive">{error.message}</div>
  if (!data?.user) return <div>Not found</div>

  return (
    <main className="max-w-7xl m-auto">
      <UserBreadcrumb userEmail={data.user.email} />
      <UserDetailsCard user={data.user} refetch={refetch} />
    </main>
  )
}

export default UserPage
