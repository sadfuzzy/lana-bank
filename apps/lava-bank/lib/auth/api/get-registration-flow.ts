import { RegistrationFlow } from "@ory/kratos-client"

import { AxiosResponse } from "axios"

import { kratosPublic } from "../../kratos-sdk"

export const getRegistrationFlow = async ({
  flowId,
  cookie,
}: {
  flowId: string
  cookie: string
}): Promise<AxiosResponse<RegistrationFlow> | Error> => {
  try {
    return await kratosPublic.getRegistrationFlow({
      id: flowId,
      cookie,
    })
  } catch (error) {
    return error instanceof Error
      ? error
      : new Error("Something went wrong, please try again.")
  }
}
