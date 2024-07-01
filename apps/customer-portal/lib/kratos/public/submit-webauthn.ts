import { AxiosError } from "axios"

import { kratosPublic } from "@/lib/kratos/sdk"

type SubmitWebAuthnData = {
  flowId: string
  webAuthLogin: string
  email: string
  csrfToken: string
}

export const submitWebAuthnFow = async ({
  flowId,
  webAuthLogin,
  email,
  csrfToken,
}: SubmitWebAuthnData): Promise<
  | {
      success: boolean
    }
  | Error
> => {
  const method = "webauthn"
  try {
    await kratosPublic.updateLoginFlow({
      flow: flowId,
      updateLoginFlowBody: {
        method,
        csrf_token: csrfToken,
        webauthn_login: webAuthLogin,
        identifier: email,
      },
    })

    return {
      success: true,
    }
  } catch (error) {
    if (error instanceof AxiosError) {
      if (error.response?.data?.ui?.messages[0]?.text)
        return new Error(error.response?.data?.ui?.messages[0]?.text)
    }
    return new Error("Something went wrong, please try again")
  }
}
