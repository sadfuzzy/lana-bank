import { t } from "../support/translation"

describe("Dashboard", () => {
  it("should display dashboard cards correctly", () => {
    cy.visit("/dashboard")

    cy.get(
      `[data-testid="${t("Dashboard.cards.activeFacilities.title")
        .toLowerCase()
        .replace(" ", "-")}"]`,
    ).should("be.visible")

    cy.get(
      `[data-testid="${t("Dashboard.cards.totalDisbursed.title")
        .toLowerCase()
        .replace(" ", "-")}"]`,
    ).should("be.visible")

    cy.get(
      `[data-testid="${t("Dashboard.cards.totalCollateral.title")
        .toLowerCase()
        .replace(" ", "-")}"]`,
    ).should("be.visible")

    cy.get(`[data-testid="dashboard-actions-list"]`).should("be.visible")
    cy.takeScreenshot("dashboard")
  })
})
