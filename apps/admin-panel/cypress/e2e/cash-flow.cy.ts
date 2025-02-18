import { print } from "@apollo/client/utilities"

import {
  CashFlowStatementDocument,
  CashFlowStatementQuery,
} from "../../lib/graphql/generated"

describe("Cash Flow Statement", () => {
  const currentDate = new Date()
  const lastMonthDate = new Date()
  lastMonthDate.setMonth(lastMonthDate.getMonth() - 1)

  beforeEach(() => {
    cy.visit("/cash-flow")
  })

  it("should render all categories and their accounts", () => {
    cy.graphqlRequest<{ data: CashFlowStatementQuery }>(
      print(CashFlowStatementDocument),
      {
        from: lastMonthDate.toISOString(),
        until: currentDate.toISOString(),
      },
    ).then((response) => {
      response.data.cashFlowStatement?.categories.forEach((category) => {
        cy.get(`[data-testid="category-${category.name.toLowerCase()}"]`).should("exist")
        category.accounts.forEach((account) => {
          cy.get(`[data-testid="account-${account.id}"]`).should("exist")
        })
      })
    })
    cy.takeScreenshot("cash-flow")
  })

  it("should display basic page elements", () => {
    cy.contains("Cash Flow Statement").should("exist")
    cy.contains("Date Range:").should("exist")
    cy.contains("Total").should("exist")

    cy.contains("Cash Flow From Operations").should("exist")
    cy.contains("Cash Flow From Investing").should("exist")
    cy.contains("Cash Flow From Financing").should("exist")
  })

  it("should allow currency switching", () => {
    cy.contains("USD").should("be.visible").click()
    cy.contains("BTC").should("be.visible").click()
    cy.takeScreenshot("cash-flow-btc-currency")
  })

  it("should switch between balance layers", () => {
    cy.contains("All").should("exist")
    cy.contains("Settled").should("exist")
    cy.contains("Pending").should("exist")

    cy.contains("All").click()
    cy.contains("Settled").click()
    cy.contains("Pending").click()
    cy.takeScreenshot("cash-flow-pending")
  })
})
