import { UserDetailsCard } from "./user-details-card"
import { UserLoansTable } from "./user-loans.table"

import { PageHeading } from "@/components/page-heading"

function UserDetails({
  params,
}: {
  params: {
    "user-id": string
  }
}) {
  const { "user-id": userId } = params
  return (
    <main>
      <PageHeading>User Details</PageHeading>
      <UserDetailsCard userId={userId} />
      <UserLoansTable userId={userId} />
    </main>
  )
}

export default UserDetails
