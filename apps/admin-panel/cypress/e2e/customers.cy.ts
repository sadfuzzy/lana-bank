describe("Customers", () => {
  it("should successfully create a new customer", () => {
    cy.visit("/customers")
    cy.contains(
      "Individuals or entities who hold accounts, loans, or credit facilities with the bank",
      { timeout: 10000 },
    )

    cy.get('[data-testid="global-create-button"]').click()
    cy.get('[data-testid="customer-create-email"]').should("be.visible")

    const testEmail = `test-${Date.now()}@example.com`
    const testTelegramId = `user${Date.now()}`

    cy.get('[data-testid="customer-create-email"]')
      .type(testEmail)
      .should("have.value", testEmail)

    cy.get('[data-testid="customer-create-telegram-id"]')
      .type(testTelegramId)
      .should("have.value", testTelegramId)

    cy.get('[data-testid="customer-create-submit-button"]')
      .contains("Review Details")
      .click()

    cy.contains(testEmail).should("be.visible")
    cy.contains(testTelegramId).should("be.visible")

    cy.get('[data-testid="customer-create-submit-button"]')
      .contains("Confirm and Submit")
      .click()

    cy.url().should(
      "match",
      /\/customers\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    )
  })
})
