import { TermsTemplateCreateInput } from "@/lib/graphql/generated"

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      takeScreenshot(filename: string): Chainable<null>
      createCustomer(email: string, telegramId: string): Chainable<string>
      createTermsTemplate(input: TermsTemplateCreateInput): Chainable<string>
      graphqlRequest<T>(query: string, variables?: Record<string, unknown>): Chainable<T>
    }
  }
}

Cypress.Commands.add(
  "graphqlRequest",
  <T>(query: string, variables?: Record<string, unknown>): Cypress.Chainable<T> => {
    return cy
      .request({
        method: "POST",
        url: "http://localhost:4455/admin/graphql",
        body: {
          query,
          variables,
        },
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then((response) => {
        if (response.body.errors) {
          throw new Error(`GraphQL Error: ${JSON.stringify(response.body.errors)}`)
        }
        return response.body
      })
  },
)

Cypress.Commands.add("takeScreenshot", (filename): Cypress.Chainable<null> => {
  cy.viewport(1263, 573)
  cy.screenshot(filename, { capture: "viewport" })
  return cy.wrap(null)
})

interface CustomerResponse {
  data: {
    customerCreate: {
      customer: {
        customerId: string
      }
    }
  }
}
Cypress.Commands.add(
  "createCustomer",
  (email: string, telegramId: string): Cypress.Chainable<string> => {
    const mutation = `
      mutation CustomerCreate($input: CustomerCreateInput!) {
        customerCreate(input: $input) {
          customer {
            customerId
          }
        }
      }
    `
    return cy
      .graphqlRequest<CustomerResponse>(mutation, {
        input: { email, telegramId },
      })
      .then((response) => response.data.customerCreate.customer.customerId)
  },
)

interface TermsTemplateResponse {
  data: {
    termsTemplateCreate: {
      termsTemplate: {
        termsId: string
      }
    }
  }
}
Cypress.Commands.add(
  "createTermsTemplate",
  (input: TermsTemplateCreateInput): Cypress.Chainable<string> => {
    const mutation = `
      mutation CreateTermsTemplate($input: TermsTemplateCreateInput!) {
        termsTemplateCreate(input: $input) {
          termsTemplate {
            termsId
          }
        }
      }
    `
    return cy
      .graphqlRequest<TermsTemplateResponse>(mutation, {
        input: {
          name: input.name,
          annualRate: input.annualRate,
          accrualInterval: input.accrualInterval,
          incurrenceInterval: input.incurrenceInterval,
          duration: {
            period: input.duration.period,
            units: input.duration.units,
          },
          liquidationCvl: input.liquidationCvl,
          marginCallCvl: input.marginCallCvl,
          initialCvl: input.initialCvl,
        },
      })
      .then((response) => response.data.termsTemplateCreate.termsTemplate.termsId)
  },
)

export {}
