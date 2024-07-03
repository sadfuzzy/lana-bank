import React from "react"

import LoanDetailsPage from "./page"

export default {
  title: "pages/loan/[loan-id]",
  component: LoanDetailsPage,
}

export const Default = () => (
  <LoanDetailsPage
    params={{
      "loan-id": "123456789",
    }}
  />
)
