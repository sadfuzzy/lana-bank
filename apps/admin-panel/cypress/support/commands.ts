declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      loginWithMagicLink(email?: string): Chainable<void>
      getMagicLink(): Chainable<string>
    }
  }
}

const AUTH_CONFIG = {
  nextAuthUrl: "http://localhost:4455/admin-panel/api/auth",
  mailhogUrl: "http://localhost:8025",
  defaultEmail: "admin@galoy.io",
  callbackUrl: "/admin-panel/profile",
} as const

Cypress.Commands.add("getMagicLink", (): Cypress.Chainable<string> => {
  return cy.wait(1000).then(() => {
    return cy
      .request({
        url: `${AUTH_CONFIG.mailhogUrl}/api/v2/messages`,
        method: "GET",
      })
      .then((response) => {
        const emails = response.body.items
        if (!emails || emails.length === 0) {
          throw new Error("No emails found in MailHog")
        }

        const latestEmail = emails[0]
        const plainTextPart = latestEmail.MIME.Parts[0]
        const emailBody = plainTextPart.Body

        const cleanBody = emailBody
          .replace(/=\r\n/g, "")
          .replace(/=3D/g, "=")
          .replace(/=2F/g, "/")
          .replace(/=3F/g, "?")
          .replace(/=26/g, "&")
          .replace(/=40/g, "@")

        cy.log("Cleaned email body:", cleanBody)

        const urlMatch = cleanBody.match(/http:\/\/localhost[^"\s]*/)

        if (!urlMatch) {
          throw new Error("Magic link not found in email content")
        }

        const magicLink = urlMatch[0]
        cy.log("Magic link found:", magicLink)

        // Return as a Chainable<string>
        return cy
          .wrap(magicLink)
          .as("magicLink")
          .then(() => magicLink)
      })
  })
})

Cypress.Commands.add("loginWithMagicLink", (email = AUTH_CONFIG.defaultEmail) => {
  cy.request({
    url: `${AUTH_CONFIG.nextAuthUrl}/csrf`,
    method: "GET",
  }).then((csrfResponse) => {
    const csrfToken = csrfResponse.body.csrfToken
    cy.log("Got CSRF token:", csrfToken)

    return cy
      .request({
        url: `${AUTH_CONFIG.nextAuthUrl}/signin/email`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: {
          email,
          csrfToken,
          callbackUrl: AUTH_CONFIG.callbackUrl,
          json: true,
        },
      })
      .then(() => {
        return cy.getMagicLink().then((magicLink) => {
          cy.log("Visiting magic link:", magicLink)
          return cy.visit(magicLink, {
            failOnStatusCode: false,
            timeout: 10000,
          })
        })
      })
  })
})

export {}
