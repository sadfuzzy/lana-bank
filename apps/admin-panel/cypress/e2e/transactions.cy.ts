describe("Transactions Deposit and Withdraw", () => {
  let customerId: string

  before(() => {
    const testEmail = `test-${Date.now()}@example.com`
    const testTelegramId = `user${Date.now()}`
    cy.createCustomer(testEmail, testTelegramId).then((id) => {
      customerId = id
      cy.log(`Created customer with ID: ${id}`)
    })
  })

  beforeEach(() => {
    cy.on("uncaught:exception", (err) => {
      if (err.message.includes("ResizeObserver loop")) {
        return false
      }
    })
  })

  it("should create a Deposit", () => {
    cy.visit(`/customers/${customerId}`)
    cy.wait(1000)
    cy.get('[data-testid="global-create-button"]').click()

    cy.get('[data-testid="create-deposit-button"]').should("be.visible").click()

    cy.get('[data-testid="deposit-amount-input"]')
      .type("5000")
      .should("have.value", "5000")

    cy.get('[data-testid="deposit-submit-button"]').click()

    cy.contains("Deposit created successfully").should("be.visible")
  })

  it("should create and cancel Withdraw", () => {
    cy.visit(`/customers/${customerId}`)
    cy.wait(1000)
    cy.get('[data-testid="global-create-button"]').click()

    cy.get('[data-testid="create-withdrawal-button"]').should("be.visible").click()

    cy.get('[data-testid="withdraw-amount-input"]')
      .type("5000")
      .should("have.value", "5000")

    cy.get('[data-testid="withdraw-submit-button"]').click()
    cy.get('[data-testid="withdraw-cancel-button"]').should("be.visible").click()
    cy.get('[data-testid="withdrawal-confirm-dialog-button"]')
      .should("be.visible")
      .click()
    cy.get("[data-testid=withdrawal-status-badge]")
      .should("be.visible")
      .invoke("text")
      .should("eq", "CANCELLED")
  })

  it("should create and approve Withdraw", () => {
    cy.visit(`/customers/${customerId}`)
    cy.wait(1000)
    cy.get('[data-testid="global-create-button"]').click()

    cy.get('[data-testid="create-withdrawal-button"]').should("be.visible").click()

    cy.get('[data-testid="withdraw-amount-input"]')
      .type("5000")
      .should("have.value", "5000")

    cy.get('[data-testid="withdraw-submit-button"]').click()
    cy.get('[data-testid="withdraw-confirm-button"]').should("be.visible").click()
    cy.get('[data-testid="withdrawal-confirm-dialog-button"]')
      .should("be.visible")
      .click()
    cy.get("[data-testid=withdrawal-status-badge]")
      .should("be.visible")
      .invoke("text")
      .should("eq", "CONFIRMED")
  })
})
