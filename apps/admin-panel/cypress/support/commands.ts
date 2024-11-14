declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      takeScreenshot(filename: string): Chainable<null>
    }
  }
}

Cypress.Commands.add("takeScreenshot", (filename): Cypress.Chainable<null> => {
  cy.viewport(1263, 573)
  cy.screenshot(filename, { capture: "viewport" })
  return cy.wrap(null)
})

export {}
