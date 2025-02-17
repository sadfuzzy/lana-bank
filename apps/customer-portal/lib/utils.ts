import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

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
  if (currency === "SATS") {
    return (
      new Intl.NumberFormat("en-US", {
        maximumFractionDigits: 0,
        useGrouping: true,
      }).format(amount) + " Sats"
    )
  }

  if (currency === "BTC") {
    return `${amount} BTC`
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount)
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

export const formatDate = (
  isoDateString: string | null | undefined,
  options: {
    includeTime: boolean
  } = { includeTime: true },
): string => {
  if (isoDateString === "-") return "-"
  if (!isoDateString) return "N/A"

  const date = new Date(isoDateString)

  const dateOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  }

  const formattedDate = date.toLocaleDateString("en-US", dateOptions)

  if (!options.includeTime) {
    return formattedDate
  }

  const formattedTime = date
    .toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
    .toUpperCase()

  return `${formattedDate}, ${formattedTime}`
}
