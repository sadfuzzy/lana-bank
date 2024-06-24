import { AxiosError } from "axios"

import { kratosPublic } from "../../kratos-sdk"

import { getCsrfToken } from "@/lib/utils"

export const startSignInFlow = async ({
  email,
}: {
  email: string
}): Promise<
  | Error
  | {
      messageId: number
      flowId: string
      csrfToken: string
      responseCookies: string[]
    }
> => {
  const method = "code"
  const signInFlow = await kratosPublic.createBrowserLoginFlow()
  const csrfToken = getCsrfToken(signInFlow.data)
  const responseCookies = signInFlow.headers["set-cookie"]
  const flowId = signInFlow.data.id

  if (!csrfToken || !responseCookies) {
    return new Error(
      "Failed to get cookie please try again, or contact support if error persist",
    )
  }

  try {
    await kratosPublic.updateLoginFlow({
      flow: flowId,
      cookie: responseCookies.join("; "),
      updateLoginFlowBody: {
        method,
        identifier: email,
        csrf_token: csrfToken,
      },
    })

    return new Error("Something went wrong, please try again.")
  } catch (error) {
    if (error instanceof AxiosError) {
      {
        return {
          messageId: error.response?.data.ui.messages[0].id,
          flowId: error.response?.data.id,
          csrfToken,
          responseCookies,
        }
      }
    }
    return new Error("Something went wrong, please try again.")
  }
}
