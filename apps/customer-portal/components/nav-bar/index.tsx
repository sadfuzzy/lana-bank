import { headers } from "next/headers"

import { AuthenticatorAssuranceLevel } from "@ory/client"

import { NavBarAuthenticated } from "./nav-bar-authenticated"

import { verifyToken } from "@/lib/auth/jwks"
import { getMeAndSession } from "@/lib/auth/get-session.ts"

export default async function NavBar() {
  const token = headers().get("authorization")
  if (!token) return null //TODO: maybe add a navbar for unauthenticated users ?

  const decodedToken = await verifyToken(token.split(" ")[1])
  if (decodedToken.sub === "anonymous") return null

  const getMeAndSessionResponse = await getMeAndSession()
  if (getMeAndSessionResponse instanceof Error) return null

  const email = getMeAndSessionResponse.me?.email
  if (!email) return null

  return (
    <NavBarAuthenticated
      email={email}
      twoFactorEnabled={
        getMeAndSessionResponse.session.authenticator_assurance_level ===
        AuthenticatorAssuranceLevel.Aal2
      }
    />
  )
}
