import { CustomerDetailsCard } from "./customer-details-card"
import { CustomerLoansTable } from "./customer-loans-table"

import { PageHeading } from "@/components/page-heading"

function customerDetails({
  params,
}: {
  params: {
    "customer-id": string
  }
}) {
  const { "customer-id": customerId } = params
  return (
    <main>
      <PageHeading>customer Details</PageHeading>
      <CustomerDetailsCard customerId={customerId} />
      <CustomerLoansTable customerId={customerId} />
    </main>
  )
}

export default customerDetails
