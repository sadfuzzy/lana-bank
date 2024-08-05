"use client"

import { useState } from "react"

import CustomerTable from "./customer-table"

import { handleCustomerSearchFormSubmit } from "./server-actions"

import { Input } from "@/components/primitive/input"

import { Button } from "@/components/primitive/button"

import { PageHeading } from "@/components/page-heading"
import CreateCustomerDialog from "@/components/customer/create-customer-dialog"

function CustomerPage({ searchParams }: { searchParams: { customerId?: string } }) {
  const { customerId } = searchParams
  const [openCreateCustomerDialog, setOpenCreateCustomerDialog] = useState(false)

  const handleOpenCreateCustomerDialog = (e: React.FormEvent) => {
    e.preventDefault()
    setOpenCreateCustomerDialog(true)
  }

  return (
    <main>
      <form
        className="flex justify-between items-center mb-8"
        action={handleCustomerSearchFormSubmit}
      >
        <PageHeading className="mb-0">Customers</PageHeading>
        <div className="flex gap-2">
          <Input
            placeholder="Find a customer by customer ID"
            id="customerId"
            name="customerId"
            className="w-80"
          />
          <Button variant="secondary">Search</Button>
          {customerId && (
            <Button variant="secondary" type="submit" name="submit" value="clear">
              X Clear
            </Button>
          )}
          <Button onClick={handleOpenCreateCustomerDialog}>Create New</Button>
        </div>
      </form>
      <CustomerTable
        customerId={customerId}
        renderCreateCustomerDialog={(refetch) => (
          <CreateCustomerDialog
            setOpenCreateCustomerDialog={setOpenCreateCustomerDialog}
            openCreateCustomerDialog={openCreateCustomerDialog}
            refetch={refetch}
          />
        )}
      />
    </main>
  )
}

export default CustomerPage
