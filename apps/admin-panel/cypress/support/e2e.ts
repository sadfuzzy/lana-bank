// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
// eslint-disable-next-line import/no-unassigned-import
import "./commands"

// Alternatively you can use CommonJS syntax:
// require('./commands')

beforeEach(() => {
  cy.session(
    "loginSession",
    () => {
      const cookies = JSON.parse(
        Buffer.from(Cypress.env("COOKIES"), "base64").toString("utf-8"),
      )

      cy.setCookie(cookies["cookie1_name"], cookies["cookie1_value"])
      cy.setCookie(cookies["cookie2_name"], cookies["cookie2_value"])

      cy.visit("/dashboard")
      cy.contains("Dashboard", { timeout: 60000 })
    },
    { cacheAcrossSpecs: true },
  )
})

Cypress.on("uncaught:exception", () => {
  return false
})
