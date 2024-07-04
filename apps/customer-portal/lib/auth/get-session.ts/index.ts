import { headers, cookies } from "next/headers"

import { Session } from "@ory/client"

import { meQuery } from "@/lib/graphql/query/me"
import { toSession } from "@/lib/kratos/public/to-session"
import { MeQuery } from "@/lib/graphql/generated"

export const getMeAndSession = async (): Promise<
  | {
      me: MeQuery["me"]
      session: Session
    }
  | Error
> => {
  const meQueryResponse = await meQuery()

  if (meQueryResponse instanceof Error) {
    return meQueryResponse
  }

  const token = headers().get("authorization")
  if (!token) return new Error("No token found in headers")

  const cookieParam = cookies()
    .getAll()
    .reduce((acc, cookie) => `${acc}${cookie.name}=${cookie.value}; `, "")

  const kratosSession = await toSession({
    cookie: cookieParam,
  })

  if (kratosSession instanceof Error) {
    return kratosSession
  }

  return {
    me: meQueryResponse.me,
    session: kratosSession,
  }
}
