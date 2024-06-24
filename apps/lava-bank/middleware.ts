import { NextRequest, NextResponse } from "next/server"

import { authService } from "./lib/auth"

const privateRoutes = ["/"]

export async function middleware(request: NextRequest): Promise<NextResponse | void> {
  const isPrivateRoute = privateRoutes.some((route) => request.nextUrl.pathname === route)
  const isAuthRoute = request.nextUrl.pathname.split("/")[1] === "auth"

  if (isAuthRoute) {
    const cookieParam = request.cookies
      .getAll()
      .reduce((acc, cookie) => `${acc}${cookie.name}=${cookie.value}; `, "")
    const response = await authService().getSession({
      cookie: cookieParam,
    })
    if (response instanceof Error) {
      return NextResponse.next()
    }
    if (response.data) {
      return NextResponse.redirect(new URL("/", request.url))
    }
    return NextResponse.next()
  }

  if (isPrivateRoute) {
    const cookieParam = request.cookies
      .getAll()
      .reduce((acc, cookie) => `${acc}${cookie.name}=${cookie.value}; `, "")
    const response = await authService().getSession({
      cookie: cookieParam,
    })
    if (response instanceof Error) {
      return NextResponse.redirect(new URL("/auth", request.url))
    }
    if (!response.data) {
      return NextResponse.redirect(new URL("/auth", request.url))
    }
    return NextResponse.next()
  }

  return NextResponse.next()
}
