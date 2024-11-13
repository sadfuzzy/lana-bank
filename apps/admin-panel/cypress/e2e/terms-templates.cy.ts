describe("Terms Template", () => {
  it("should successfully create a new terms template", () => {
    cy.visit("/terms-templates")

    cy.get('[data-testid="global-create-button"]').click()

    const templateName = `Test Template ${Date.now()}`
    cy.get('[data-testid="terms-template-name-input"]')
      .type(templateName)
      .should("have.value", templateName)

    cy.get('[data-testid="terms-template-annual-rate-input"]')
      .type("5.5")
      .should("have.value", "5.5")

    cy.get('[data-testid="terms-template-duration-units-input"]')
      .type("12")
      .should("have.value", "12")

    cy.get('[data-testid="terms-template-duration-period-select"]').select("MONTHS")

    cy.get('[data-testid="terms-template-accrual-interval-select"]').select(
      "END_OF_MONTH",
    )
    cy.get('[data-testid="terms-template-incurrence-interval-select"]').select(
      "END_OF_MONTH",
    )

    cy.get('[data-testid="terms-template-initial-cvl-input"]')
      .type("140")
      .should("have.value", "140")

    cy.get('[data-testid="terms-template-margin-call-cvl-input"]')
      .type("120")
      .should("have.value", "120")

    cy.get('[data-testid="terms-template-liquidation-cvl-input"]')
      .type("110")
      .should("have.value", "110")

    cy.get('[data-testid="terms-template-submit-button"]').click()

    cy.url().should(
      "match",
      /\/terms-templates\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    )
    cy.contains(templateName).should("be.visible")
  })
})
