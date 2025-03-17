import { print } from "@apollo/client/utilities"

import {
  ProfitAndLossStatementDocument,
  ProfitAndLossStatementQuery,
} from "../../lib/graphql/generated"

import { t } from "../support/translation"

const PL = "ProfitAndLoss"
const CLS = "CurrencyLayerSelection"

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
    cy.contains(t(PL + ".title")).should("exist")
    cy.contains(t(PL + ".dateRange") + ":").should("exist")
    cy.contains(t(PL + ".net")).should("exist")
  })

  it("should allow currency switching", () => {
    cy.contains(t(CLS + ".currency.options.usd"))
      .should("be.visible")
      .click()
    cy.contains(t(CLS + ".currency.options.btc"))
      .should("be.visible")
      .click()
    cy.takeScreenshot("profit-and-loss-btc-currency")
  })

  it("should switch between balance layers", () => {
    cy.contains(t(CLS + ".layer.options.all")).should("exist")
    cy.contains(t(CLS + ".layer.options.settled")).should("exist")
    cy.contains(t(CLS + ".layer.options.pending")).should("exist")

    cy.contains(t(CLS + ".layer.options.all")).click()
    cy.contains(t(CLS + ".layer.options.settled")).click()
    cy.contains(t(CLS + ".layer.options.pending")).click()
    cy.takeScreenshot("profit-and-loss-pending")
  })
})
