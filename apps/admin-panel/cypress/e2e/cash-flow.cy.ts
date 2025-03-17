import { print } from "@apollo/client/utilities"

import { t } from "../support/translation"
import {
  CashFlowStatementDocument,
  CashFlowStatementQuery,
} from "../../lib/graphql/generated"

const CFS = "CashFlowStatement"
const CLS = "CurrencyLayerSelection"

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
    cy.contains(t(CFS + ".title")).should("exist")
    cy.contains(t(CFS + ".dateRange") + ":").should("exist")
    cy.contains(t(CFS + ".total")).should("exist")

    cy.contains("Cash Flow From Operations").should("exist")
    cy.contains("Cash Flow From Investing").should("exist")
    cy.contains("Cash Flow From Financing").should("exist")
  })

  it("should allow currency switching", () => {
    cy.contains(t(CLS + ".currency.options.usd"))
      .should("be.visible")
      .click()
    cy.contains(t(CLS + ".currency.options.btc"))
      .should("be.visible")
      .click()
    cy.takeScreenshot("cash-flow-btc-currency")
  })

  it("should switch between balance layers", () => {
    cy.contains(t(CLS + ".layer.options.all")).should("exist")
    cy.contains(t(CLS + ".layer.options.settled")).should("exist")
    cy.contains(t(CLS + ".layer.options.pending")).should("exist")

    cy.contains(t(CLS + ".layer.options.all")).click()
    cy.contains(t(CLS + ".layer.options.settled")).click()
    cy.contains(t(CLS + ".layer.options.pending")).click()
    cy.takeScreenshot("cash-flow-pending")
  })
})
