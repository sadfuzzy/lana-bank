import { print } from "@apollo/client/utilities"

import {
  ProfitAndLossStatementDocument,
  ProfitAndLossStatementQuery,
} from "../../lib/graphql/generated"

describe("Profit and Loss Statement", () => {
  const currentDate = new Date()
  const lastMonthDate = new Date()
  lastMonthDate.setMonth(lastMonthDate.getMonth() - 1)

  beforeEach(() => {
    cy.visit("/profit-and-loss")
  })

  it("should render all categories and their accounts", () => {
    cy.graphqlRequest<{ data: ProfitAndLossStatementQuery }>(
      print(ProfitAndLossStatementDocument),
      {
        from: lastMonthDate.toISOString(),
        until: currentDate.toISOString(),
      },
    ).then((response) => {
      response.data.profitAndLossStatement?.categories.forEach((category) => {
        cy.get(`[data-testid="category-${category.name.toLowerCase()}"]`).should("exist")
        category.accounts.forEach((account) => {
          cy.get(`[data-testid="account-${account.id}"]`).should("exist")
        })
      })
    })
    cy.takeScreenshot("profit-and-loss")
  })

  it("should display basic page elements", () => {
    cy.contains("Profit and Loss Statement").should("exist")
    cy.contains("Date Range:").should("exist")
    cy.contains("NET").should("exist")
  })

  it("should allow currency switching", () => {
    cy.contains("USD").should("be.visible").click()
    cy.contains("BTC").should("be.visible").click()
    cy.takeScreenshot("profit-and-loss-btc-currency")
  })

  it("should switch between balance layers", () => {
    cy.contains("All").should("exist")
    cy.contains("Settled").should("exist")
    cy.contains("Pending").should("exist")

    cy.contains("All").click()
    cy.contains("Settled").click()
    cy.contains("Pending").click()
    cy.takeScreenshot("profit-and-loss-pending")
  })
})
