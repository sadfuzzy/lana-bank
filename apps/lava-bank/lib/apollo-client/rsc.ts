import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client"
import { registerApolloClient } from "@apollo/experimental-nextjs-app-support/rsc"

import { env } from "@/env"

export const { getClient } = registerApolloClient(() => {
  return new ApolloClient({
    cache: new InMemoryCache(),
    link: new HttpLink({
      uri: `${env.NEXT_PUBLIC_CORE_URL}/graphql`,
      fetchOptions: { cache: "no-store" },
    }),
  })
})
