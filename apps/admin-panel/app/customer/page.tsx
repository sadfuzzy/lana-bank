import { redirect } from "next/navigation"

import CustomerTable from "./customer-table"

import { Input } from "@/components/primitive/input"

import { Button } from "@/components/primitive/button"

import { PageHeading } from "@/components/page-heading"

const searchCustomer = async (formData: FormData) => {
  "use server"
  if (formData.get("submit") === "clear") {
    redirect(`/customer`)
  }

  const customerId = formData.get("customerId")
  if (!customerId || typeof customerId !== "string") {
    redirect(`/customer`)
  }
  redirect(`/customer?customerId=${customerId}`)
}

async function customerPage({ searchParams }: { searchParams: { customerId?: string } }) {
  const { customerId } = searchParams

  return (
    <main>
      <form className="flex justify-between items-center mb-8" action={searchCustomer}>
        <PageHeading className="mb-0">Customers</PageHeading>
        <div className="flex gap-2">
          <Input
            placeholder="Find a customer by customer ID"
            id="customerId"
            name="customerId"
            className="w-80"
          />
          <Button variant="primary">Search</Button>
          {customerId && (
            <Button type="submit" name="submit" value="clear">
              X Clear
            </Button>
          )}
        </div>
      </form>
      <CustomerTable customerId={customerId} />
    </main>
  )
}

export default customerPage
