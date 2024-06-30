import { LoginFlow } from "@ory/client"

import { AxiosError } from "axios"

import { kratosPublic } from "@/lib/kratos/sdk"

import { getCsrfToken } from "@/lib/kratos/utils"

type SubmitTotpData = {
  flowId: string
  totpCode: string
}

export const submitTotpFow = async ({
  flowId,
  totpCode,
}: SubmitTotpData): Promise<
  | {
      success: boolean
    }
  | Error
> => {
  const method = "totp"
  let flow: LoginFlow

  try {
    flow = (await kratosPublic.getLoginFlow({ id: flowId })).data
  } catch {
    return new Error("Flow not found, please go back and try again")
  }

  const csrfToken = getCsrfToken(flow)
  if (!csrfToken) return new Error("Kratos API didn't send CSRF token")

  try {
    await kratosPublic.updateLoginFlow({
      flow: flowId,
      updateLoginFlowBody: {
        method,
        totp_code: totpCode,
        csrf_token: csrfToken,
      },
    })

    return {
      success: true,
    }
  } catch (error) {
    if (error instanceof AxiosError) {
      return new Error(
        error.response?.data?.ui?.messages[0]?.text ||
          "Something went wrong, please try again",
      )
    }
    return new Error("Something went wrong, please try again")
  }
}
