import { AxiosError } from "axios"

import { kratosPublic } from "../../kratos-sdk"

import { getCsrfToken } from "@/lib/utils"

export const startRegisterFlow = async ({
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
  const registerFlow = await kratosPublic.createBrowserRegistrationFlow()
  const csrfToken = getCsrfToken(registerFlow.data)
  const responseCookies = registerFlow.headers["set-cookie"]
  const flowId = registerFlow.data.id

  if (!csrfToken || !responseCookies) {
    return new Error("Failed to get csrf token")
  }

  try {
    await kratosPublic.updateRegistrationFlow({
      flow: flowId,
      cookie: responseCookies.join("; "),
      updateRegistrationFlowBody: {
        method,
        traits: {
          email,
        },
        csrf_token: csrfToken,
      },
    })
    //this will fail as this auth method is code based and require two submits/steps.
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
