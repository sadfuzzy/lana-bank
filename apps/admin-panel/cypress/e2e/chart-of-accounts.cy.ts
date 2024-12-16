import { print } from "@apollo/client/utilities"
import {
  GetOnBalanceSheetChartOfAccountsDocument,
  GetOnBalanceSheetChartOfAccountsQuery,
} from "../../lib/graphql/generated"

describe("Chart Of Accounts", () => {
  beforeEach(() => {
    cy.visit("/chart-of-accounts")
  })

  it("should render all categories and their accounts", () => {
    cy.graphqlRequest<{ data: GetOnBalanceSheetChartOfAccountsQuery }>(
      print(GetOnBalanceSheetChartOfAccountsDocument),
    ).then((response) => {
      response.data.chartOfAccounts?.categories.forEach((category) => {
        cy.get(`[data-testid="category-${category.name.toLowerCase()}"]`).should("exist")
        category.accounts.forEach((account) => {
          cy.get(`[data-testid="account-${account.id}"]`).should("exist")
        })
      })
    })
  })

  it("should display basic page elements", () => {
    cy.contains("Chart Of Accounts").should("exist")
    cy.contains("Regular").should("exist")
    cy.contains("Off Balance Sheet").should("exist")
  })
})
