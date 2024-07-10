import { generateRandomEmail } from "../../support/utils"

describe("Login and OTP Submission", () => {
  it("successfully logs in using email and submits OTP", () => {
    const email = generateRandomEmail()
    cy.registerUser(email).then(() => {
      cy.visit("/auth")
      cy.get('[data-test-id="auth-email-input"]').type(email)
      cy.get('[data-test-id="auth-email-submit-btn"]').click()
      cy.getOTP(email).then((otp) => {
        cy.get('[data-test-id="auth-otp-input"]').type(otp)
        cy.url().should("eq", Cypress.config().baseUrl + "/")
      })
    })
  })
  it("fail login for incorrect OTP", () => {
    const email = generateRandomEmail()
    cy.registerUser(email).then(() => {
      cy.visit("/auth")
      cy.get('[data-test-id="auth-email-input"]').type(email)
      cy.get('[data-test-id="auth-email-submit-btn"]').click()
      cy.get('[data-test-id="auth-otp-input"]').type("000000")
      cy.get('[data-test-id="auth-otp-error"]').should(
        "have.text",
        "Invalid OTP or OTP has expired. Please go back and try again.",
      )
    })
  })
})
