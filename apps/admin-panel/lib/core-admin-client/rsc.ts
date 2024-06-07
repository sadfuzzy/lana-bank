import { HttpLink } from "@apollo/client"
import {
  registerApolloClient,
  ApolloClient,
  InMemoryCache,
} from "@apollo/experimental-nextjs-app-support"

import { env } from "@/env"

export const { getClient, query, PreloadQuery } = registerApolloClient(() => {
  return new ApolloClient({
    cache: new InMemoryCache(),
    link: new HttpLink({
      uri: `${env.NEXT_PUBLIC_CORE_ADMIN_URL}/graphql`,
    }),
  })
})
