import { headers } from "next/headers"

import { NavBarAuthenticated } from "./nav-bar-authenticated"

import { verifyToken } from "@/lib/auth/jwks"

export default async function NavBar() {
  const token = headers().get("authorization")

  if (!token) return null //TODO: maybe add a navbar for unauthenticated users ?

  const decodedToken = await verifyToken(token.split(" ")[1])
  console.log(decodedToken)
  if (decodedToken.sub === "anonymous") return null

  return <NavBarAuthenticated email={"sid"} />
}
