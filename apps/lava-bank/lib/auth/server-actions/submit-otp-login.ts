"use server"
import { cookies } from "next/headers"

import { AxiosError } from "axios"

import { redirect } from "next/navigation"

import { authService } from ".."
import { getCsrfCookiesAsString } from "../utils"

import { setCookieFromString } from "./set-cookie-from-string"

import { createErrorResponse } from "@/lib/utils"

export const submitOtpLogin = async ({
  flowId,
  code,
  email,
}: {
  flowId: string
  code: string
  email: string
}): Promise<void | ServerActionResponse<null>> => {
  const csrfToken = cookies().get("csrfToken")?.value
  const allCookies = cookies().getAll()

  if (!csrfToken)
    return createErrorResponse({
      errorMessage: "Something went wrong, please try again.",
    })

  const res = await authService().verifyEmailCodeLoginFlow({
    code,
    csrfToken,
    email,
    flow: flowId,
    cookie: getCsrfCookiesAsString(allCookies),
  })

  if (res instanceof AxiosError) {
    if (
      res.response?.data?.ui?.messages[0]?.id &&
      res.response?.data?.ui?.messages[0]?.text
    ) {
      return createErrorResponse({
        errorMessage: res.response?.data.ui.messages[0].text,
        id: res.response?.data.ui.messages[0].id,
      })
    }

    return createErrorResponse({
      errorMessage: "Something went wrong, please try again.",
    })
  }

  if (res instanceof Error) return createErrorResponse({ errorMessage: res.message })

  if (!res.headers["set-cookie"])
    return createErrorResponse({
      errorMessage: "Something went wrong, please try again.",
    })

  res.headers["set-cookie"].forEach(setCookieFromString)

  if (res.status === 200) redirect("/")
}
