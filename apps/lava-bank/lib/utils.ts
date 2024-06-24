import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { LoginFlow, UiNode, UiNodeAttributes } from "@ory/kratos-client"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const currencyConverter = {
  centsToUsd: (cents: number) => {
    return Number((cents / 100).toFixed(2))
  },

  btcToSatoshi: (btc: number) => {
    return Number((btc * 100000000).toFixed(0))
  },

  satoshiToBtc: (satoshi: number) => {
    return satoshi / 100000000
  },

  usdToCents: (usd: number) => {
    return Number((usd * 100).toFixed(0))
  },
}

export const formatCurrency = ({
  amount,
  currency,
}: {
  amount: number
  currency: string
}) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount)
}

export const getCsrfToken = (signInFlow: LoginFlow): string | undefined => {
  for (const node of signInFlow.ui.nodes) {
    if (isInputNode(node)) {
      if (node.attributes.name === "csrf_token") {
        return node.attributes.value
      }
    }
  }
}

export function isInputNode(
  node: UiNode,
): node is UiNode & { attributes: UiNodeAttributes & { name: string; value?: string } } {
  return (
    "attributes" in node &&
    typeof node.attributes === "object" &&
    "name" in node.attributes
  )
}

export const createErrorResponse = ({
  errorMessage,
  id,
}: {
  errorMessage: string
  id?: number
}) => {
  return {
    data: null,
    error: {
      id,
      message: errorMessage,
    },
  }
}
