import { ApolloClient, ApolloLink, HttpLink, InMemoryCache } from "@apollo/client"
import { registerApolloClient } from "@apollo/experimental-nextjs-app-support"
import { headers } from "next/headers"

import { basePath, env } from "@/env"

export const { getClient } = registerApolloClient(() => {
  const requestHeaders = Object.fromEntries(
    Array.from(headers()).map(([key, value]) => [key, value]),
  )

  console.log("kratos url ----", env.NEXT_PUBLIC_KRATOS_PUBLIC_API)
  console.log("core url ---------", `${env.NEXT_PUBLIC_CORE_URL + basePath}/graphql`)
  console.log("Headers Object:", JSON.stringify(requestHeaders, null, 2))

  return new ApolloClient({
    cache: new InMemoryCache(),
    link: ApolloLink.from([
      new HttpLink({
        uri: `${env.NEXT_PUBLIC_CORE_URL + basePath}/graphql`,
        fetchOptions: { cache: "no-store" },
        headers: requestHeaders,
      }),
    ]),
  })
})
