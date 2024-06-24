import { SuccessfulNativeRegistration } from "@ory/kratos-client"
import { AxiosError, AxiosResponse } from "axios"

import { kratosPublic } from "../../kratos-sdk"

export const verifyEmailCodeRegisterFlow = async ({
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
}): Promise<Error | AxiosError | AxiosResponse<SuccessfulNativeRegistration>> => {
  const method = "code"
  try {
    return await kratosPublic.updateRegistrationFlow({
      flow,
      cookie,
      updateRegistrationFlowBody: {
        method,
        code,
        traits: {
          email,
        },
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
