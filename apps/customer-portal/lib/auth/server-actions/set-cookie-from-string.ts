"use server"

import { cookies } from "next/headers"

type ResponseCookie = {
  path?: string
  maxAge?: number
  httpOnly?: boolean
  secure?: boolean
  sameSite?: "strict" | "lax" | "none"
}

export const setCookieFromString = async (cookieString: string) => {
  const cookieParts = cookieString.split("; ")
  const [nameValue, ...attributes] = cookieParts
  const equalIndex = nameValue.indexOf("=")
  const name = nameValue.substring(0, equalIndex)
  const value = nameValue.substring(equalIndex + 1)
  const options: ResponseCookie = {}

  attributes.forEach((attribute) => {
    const [key, val] = attribute.split("=")
    switch (key.toLowerCase()) {
      case "path":
        options.path = val
        break
      case "max-age":
        options.maxAge = parseInt(val)
        break
      case "httponly":
        options.httpOnly = true
        break
      case "secure":
        options.secure = true
        break
      case "samesite":
        options.sameSite = val as "strict" | "lax" | "none"
        break
    }
  })

  cookies().set(name, value, options)
}
