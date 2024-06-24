import { UiNode } from "@ory/kratos-client"
import { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies"

export const emailParserFromUiNodeRegister = (nodes: UiNode[]) => {
  let email = null
  nodes.forEach((node) => {
    const attributes = node.attributes as { name?: string; value?: string }
    if (attributes.name === "traits.email") {
      email = attributes.value
    }
  })
  return email
}

export const emailParserFromUiNodeLogin = (nodes: UiNode[]) => {
  let email = null
  nodes.forEach((node) => {
    const attributes = node.attributes as { name?: string; value?: string }
    if (attributes.name === "identifier") {
      email = attributes.value
    }
  })
  return email
}

export const getCsrfCookiesAsString = (allCookies: RequestCookie[]): string => {
  const csrfCookies = allCookies
    .filter((cookie) => cookie.name.toLowerCase().startsWith("csrf_token"))
    .reduce((obj: { [key: string]: string }, cookie) => {
      obj[cookie.name] = cookie.value
      return obj
    }, {})

  const cookieString = Object.entries(csrfCookies)
    .map(([key, value]) => `${key}=${value}`)
    .join("; ")

  return cookieString
}
