"use server"

import { cookies } from "next/headers"

import { redirect } from "next/navigation"

import { authService } from ".."

import { setCookieFromString } from "./set-cookie-from-string"

import { uiMessage } from "@/lib/kratos-ui-message"
import { createErrorResponse } from "@/lib/utils"

export const createLoginOrRegisterFlow = async ({
  email,
}: {
  email: string
}): Promise<void | ServerActionResponse<null>> => {
  const startSignInFlow = await authService().startSignInFlow({ email })

  if (startSignInFlow instanceof Error) {
    return createErrorResponse({ errorMessage: startSignInFlow.message })
  }

  if (startSignInFlow?.messageId === uiMessage.USER_NOT_EXIST.id) {
    return handleRegisterFlow(email)
  }

  if (startSignInFlow?.messageId !== uiMessage.OTP_EMAIL_SENT_SIGN_IN.id) {
    return createErrorResponse({
      errorMessage: "Something went wrong, please try again.",
    })
  }

  startSignInFlow.responseCookies.forEach(setCookieFromString)
  cookies().set({
    name: "csrfToken",
    value: startSignInFlow.csrfToken,
    httpOnly: true,
    sameSite: "lax",
    secure: true,
  })

  redirect("/auth/signin/otp?flow=" + startSignInFlow.flowId)
}

const handleRegisterFlow = async (email: string) => {
  const startRegisterFlow = await authService().startRegisterFlow({
    email,
  })

  if (startRegisterFlow instanceof Error) {
    return createErrorResponse({ errorMessage: startRegisterFlow.message })
  }

  if (startRegisterFlow?.messageId !== uiMessage.OTP_EMAIL_SENT_REGISTER.id) {
    return createErrorResponse({
      errorMessage: "Something went wrong, please try again.",
    })
  }

  startRegisterFlow.responseCookies.forEach(setCookieFromString)
  cookies().set({
    name: "csrfToken",
    value: startRegisterFlow.csrfToken,
    httpOnly: true,
    sameSite: "lax",
    secure: true,
  })

  redirect("/auth/register/otp?flow=" + startRegisterFlow.flowId)
}
