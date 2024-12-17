describe("Dashboard", () => {
  it("should display dashboard cards correctly", () => {
    // TODO MOCK THE APIs to get better tests.

    cy.visit("/dashboard")

    cy.get('[data-testid="active-facilities"]').should("be.visible")

    cy.get('[data-testid="total-disbursed"]').should("be.visible")

    cy.get('[data-testid="total-collateral"]').should("be.visible")

    cy.get(`[data-testid="dashboard-actions-list"]`).should("be.visible")
    cy.takeScreenshot("dashboard")
  })
})
