"use client"
import React, { useEffect } from "react"
import { gql } from "@apollo/client"

import UserDetailsCard from "./details"

import { useBreadcrumb } from "@/app/breadcrumb-provider"
import { useGetUserDetailsQuery } from "@/lib/graphql/generated"
import { DetailsPageSkeleton } from "@/components/details-page-skeleton"

gql`
  query GetUserDetails($id: UUID!) {
    user(id: $id) {
      ...UserFields
    }
  }
`

function UserPage({
  params,
}: {
  params: {
    "user-id": string
  }
}) {
  const { "user-id": userId } = params
  const { setCustomLinks, resetToDefault } = useBreadcrumb()

  const { data, loading, error } = useGetUserDetailsQuery({
    variables: { id: userId },
  })

  useEffect(() => {
    if (data?.user) {
      setCustomLinks([
        { title: "Dashboard", href: "/dashboard" },
        { title: "Users", href: "/users" },
        { title: data.user.email, isCurrentPage: true },
      ])
    }

    return () => {
      resetToDefault()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.user])

  if (loading) {
    return <DetailsPageSkeleton tabs={0} tabsCards={0} />
  }
  if (error) return <div className="text-destructive">{error.message}</div>
  if (!data?.user) return <div>Not found</div>

  return (
    <main className="max-w-7xl m-auto">
      <UserDetailsCard user={data.user} />
    </main>
  )
}

export default UserPage
