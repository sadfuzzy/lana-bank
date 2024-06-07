"use client"

import { ApolloLink, HttpLink } from "@apollo/client"
import {
  ApolloClient,
  ApolloNextAppProvider,
  InMemoryCache,
  SSRMultipartLink,
} from "@apollo/experimental-nextjs-app-support"

import { env } from "@/env"

function makeClient() {
  const httpLink = new HttpLink({
    uri: `${env.NEXT_PUBLIC_CORE_ADMIN_URL}/graphql`,
  })

  return new ApolloClient({
    cache: new InMemoryCache(),
    link:
      typeof window === "undefined"
        ? ApolloLink.from([
            new SSRMultipartLink({
              stripDefer: true,
            }),
            httpLink,
          ])
        : httpLink,
  })
}

export function ApolloWrapper({ children }: React.PropsWithChildren) {
  return <ApolloNextAppProvider makeClient={makeClient}>{children}</ApolloNextAppProvider>
}
