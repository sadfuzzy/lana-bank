import { SuccessfulNativeLogin } from "@ory/kratos-client"
import { AxiosError, AxiosResponse } from "axios"

import { kratosPublic } from "../../kratos-sdk"

export const verifyEmailCodeLoginFlow = async ({
  flow,
  email,
  code,
  csrfToken,
  cookie,
}: {
  flow: string
  email: string
  code: string
  csrfToken: string
  cookie: string
}): Promise<Error | AxiosError | AxiosResponse<SuccessfulNativeLogin>> => {
  const method = "code"
  try {
    return await kratosPublic.updateLoginFlow({
      flow,
      cookie,
      updateLoginFlowBody: {
        method,
        code,
        identifier: email,
        csrf_token: csrfToken,
      },
    })
  } catch (error) {
    if (error instanceof AxiosError) {
      return error as AxiosError
    }
    return new Error("Something went wrong, please try again.")
  }
}
