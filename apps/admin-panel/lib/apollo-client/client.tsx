"use client"

import { Resolvers } from "@apollo/client"
import { relayStylePagination } from "@apollo/client/utilities"
import createUploadLink from "apollo-upload-client/createUploadLink.mjs"

import {
  ApolloClient,
  ApolloNextAppProvider,
  InMemoryCache,
  SSRMultipartLink,
} from "@apollo/experimental-nextjs-app-support"

import {
  CreditFacility,
  Customer,
  GetRealtimePriceUpdatesDocument,
  GetRealtimePriceUpdatesQuery,
  Loan,
  LoanStatus,
} from "@/lib/graphql/generated"

import { CENTS_PER_USD, SATS_PER_BTC } from "@/lib/utils"
import { calculateBaseAmountInCents } from "@/app/credit-facilities/[credit-facility-id]/snapshot"

function makeClient({ coreAdminGqlUrl }: { coreAdminGqlUrl: string }) {
  const uploadLink = createUploadLink({
    uri: coreAdminGqlUrl,
    credentials: "include",
    fetchOptions: { cache: "no-store" },
  })
  const ssrMultipartLink = new SSRMultipartLink({
    stripDefer: true,
  })
  const link =
    typeof window === "undefined" ? ssrMultipartLink.concat(uploadLink) : uploadLink

  const cache = new InMemoryCache({
    typePolicies: {
      AccountSetAndSubAccounts: {
        fields: {
          subAccounts: relayStylePagination(),
        },
      },
      Query: {
        fields: {
          loans: relayStylePagination(),
          creditFacilities: relayStylePagination(),
        },
      },
    },
  })

  const fetchData = (cache: InMemoryCache): Promise<GetRealtimePriceUpdatesQuery> =>
    new Promise((resolve) => {
      const priceInfo = cache.readQuery({
        query: GetRealtimePriceUpdatesDocument,
      }) as GetRealtimePriceUpdatesQuery

      resolve(priceInfo)
    })

  const resolvers: Resolvers = {
    Loan: {
      currentCvl: async (loan: Loan, _, { cache }) => {
        const priceInfo = await fetchData(cache)
        if (!priceInfo) return null

        const principalValueInUsd = loan.principal / CENTS_PER_USD

        const collateralValueInSats = loan.balance.collateral.btcBalance
        const collateralValueInCents =
          (priceInfo.realtimePrice.usdCentsPerBtc * collateralValueInSats) / SATS_PER_BTC
        const collateralValueInUsd = collateralValueInCents / CENTS_PER_USD

        const outstandingAmountInUsd = loan.balance.outstanding.usdBalance / CENTS_PER_USD

        if (collateralValueInUsd == 0 || loan.status === LoanStatus.Closed) return 0

        const newOutstandingAmount =
          outstandingAmountInUsd === 0 ? principalValueInUsd : outstandingAmountInUsd
        const cvl = (collateralValueInUsd / newOutstandingAmount) * CENTS_PER_USD

        return Number(cvl.toFixed(2))
      },
      collateralToMatchInitialCvl: async (loan: Loan, _, { cache }) => {
        const priceInfo = await fetchData(cache)
        if (!priceInfo) return null

        return Math.floor(
          ((loan.loanTerms.initialCvl * loan.principal) /
            priceInfo.realtimePrice.usdCentsPerBtc /
            CENTS_PER_USD) *
            SATS_PER_BTC,
        )
      },
    },
    CreditFacility: {
      currentCvl: async (facility: CreditFacility, _, { cache }) => {
        const priceInfo = await fetchData(cache)
        if (!priceInfo) return null

        const collateralValueInUsd =
          (facility.collateral * priceInfo.realtimePrice.usdCentsPerBtc) /
          (SATS_PER_BTC * CENTS_PER_USD)

        const basisAmountInUsd = calculateBaseAmountInCents(facility) / CENTS_PER_USD

        if (collateralValueInUsd === 0) return 0

        const cvl = (collateralValueInUsd / basisAmountInUsd) * 100

        return Number(cvl.toFixed(2))
      },
      collateralToMatchInitialCvl: async (facility: CreditFacility, _, { cache }) => {
        const priceInfo = await fetchData(cache)
        if (!priceInfo) return null

        const basisAmountInUsd = calculateBaseAmountInCents(facility) / CENTS_PER_USD

        const initialCvlDecimal = facility.creditFacilityTerms.initialCvl / 100

        const requiredCollateralInSats =
          (initialCvlDecimal * basisAmountInUsd * SATS_PER_BTC) /
          (priceInfo.realtimePrice.usdCentsPerBtc / CENTS_PER_USD)

        return Math.floor(requiredCollateralInSats)
      },
    },
    Customer: {
      transactions: async (customer: Customer) => {
        const deposits = customer.deposits
        const withdrawals = customer.withdrawals

        return [...deposits, ...withdrawals].sort((a, b) => {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        })
      },
    },
  }

  return new ApolloClient({
    defaultOptions: {
      query: {
        fetchPolicy: "no-cache",
      },
      watchQuery: {
        fetchPolicy: "no-cache",
      },
    },
    cache,
    resolvers,
    link,
  })
}

export default function ApolloWrapper({
  config,
  children,
}: {
  config: {
    coreAdminGqlUrl: string
  }
  children: React.ReactNode
}) {
  const client = makeClient(config)
  return (
    <ApolloNextAppProvider makeClient={() => client}>{children}</ApolloNextAppProvider>
  )
}
