"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { gql } from "@apollo/client"

import CustomerTable from "./list"
import { CreateCustomerDialog } from "./create"

import { PageHeading } from "@/components/page-heading"
import { isEmail, isUUID } from "@/lib/utils"

gql`
  query getCustomerByCustomerEmail($email: String!) {
    customerByEmail(email: $email) {
      customerId
      email
      telegramId
      status
      level
      applicantId
      subjectCanRecordDeposit
      subjectCanInitiateWithdrawal
      subjectCanCreateCreditFacility
      balance {
        checking {
          settled
          pending
        }
      }
    }
  }

  query getCustomerByCustomerId($id: UUID!) {
    customer(id: $id) {
      customerId
      email
      telegramId
      status
      level
      applicantId
      subjectCanRecordDeposit
      subjectCanInitiateWithdrawal
      subjectCanCreateCreditFacility
      balance {
        checking {
          settled
          pending
        }
      }
    }
  }

  query Customers($first: Int!, $after: String) {
    customers(first: $first, after: $after) {
      nodes {
        customerId
        email
        telegramId
        subjectCanRecordDeposit
        subjectCanInitiateWithdrawal
        subjectCanCreateCreditFacility
        balance {
          checking {
            settled
            pending
          }
        }
      }
      pageInfo {
        endCursor
        startCursor
        hasNextPage
        hasPreviousPage
      }
    }
  }
`

function CustomerPage({ searchParams }: { searchParams: { search?: string } }) {
  const { search } = searchParams
  const [searchInput, setSearchInput] = useState(search || "")
  const [openCreateCustomerDialog, setOpenCreateCustomerDialog] = useState(false)
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchInput) {
      let searchType = "unknown"
      if (isUUID(searchInput)) {
        searchType = "customerId"
      } else if (isEmail(searchInput)) {
        searchType = "email"
      }
      router.push(
        `/customers?search=${encodeURIComponent(searchInput)}&searchType=${searchType}`,
      )
    } else {
      router.push("/customers")
    }
  }

  const handleClear = () => {
    setSearchInput("")
    router.push("/customers")
  }

  const searchType = search
    ? isUUID(search)
      ? "customerId"
      : isEmail(search)
        ? "email"
        : "unknown"
    : undefined

  return (
    <main>
      <form className="flex justify-between items-center mb-4" onSubmit={handleSearch}>
        <PageHeading className="mb-0">Customers</PageHeading>
      </form>
      <CustomerTable
        searchValue={search}
        searchType={searchType as "customerId" | "email" | "unknown" | undefined}
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
