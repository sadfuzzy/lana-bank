describe("Regulatory Report Management", () => {
  beforeEach(() => {
    cy.on("uncaught:exception", (err) => {
      if (err.message.includes("ResizeObserver loop")) {
        return false
      }
    })
    cy.visit("/regulatory-reporting")
  })

  it("should create a new report", () => {
    cy.get('[data-testid="generate-report-button"]').click()
    cy.takeScreenshot("1_generate_report_button")

    cy.get('[data-testid="create-report-dialog"]').within(() => {
      cy.get('[data-testid="dialog-title"]').should("contain", "Create New Report")
      cy.get('[data-testid="dialog-description"]').should(
        "contain",
        "Are you sure you want to create a new report?",
      )
      cy.get('[data-testid="create-report-submit"]').click()
      cy.takeScreenshot("2_create_report_dialog")
    })

    cy.contains("Report creation started").should("be.visible")
    cy.takeScreenshot("3_report_creation_success")
  })

  it("should display report details correctly", () => {
    cy.wait(1000)
    cy.get('[data-testid="report-id"]').should("be.visible")
    cy.get('[data-testid="report-status"]').should("be.visible")
    cy.takeScreenshot("4_report_status")
    cy.get('[data-testid="report-downloads"]').should("be.visible")
    cy.takeScreenshot("5_report_details")
  })
})
