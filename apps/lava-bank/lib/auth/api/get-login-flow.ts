import { kratosPublic } from "../../kratos-sdk"

export const getLoginFlow = async ({
  flowId,
  cookie,
}: {
  flowId: string
  cookie: string
}) => {
  try {
    return await kratosPublic.getLoginFlow({
      id: flowId,
      cookie,
    })
  } catch (error) {
    return error instanceof Error
      ? error
      : new Error("Something went wrong, please try again.")
  }
}
