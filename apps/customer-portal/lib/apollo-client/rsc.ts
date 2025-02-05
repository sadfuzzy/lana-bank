import { ApolloClient, ApolloLink, HttpLink, InMemoryCache } from "@apollo/client"
import { registerApolloClient } from "@apollo/experimental-nextjs-app-support"
import { headers } from "next/headers"

import { env } from "@/env"

export const { getClient } = registerApolloClient(() => {
  const requestHeaders = Object.fromEntries(
    Array.from(headers()).map(([key, value]) => [key, value]),
  )

  return new ApolloClient({
    cache: new InMemoryCache(),
    link: ApolloLink.from([
      new HttpLink({
        uri: `${env.NEXT_PUBLIC_CORE_URL + env.NEXT_PUBLIC_BASE_PATH}/graphql`,
        fetchOptions: { cache: "no-store" },
        headers: requestHeaders,
      }),
    ]),
  })
})
