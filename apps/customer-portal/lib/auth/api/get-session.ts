import { kratosPublic } from "../../kratos-sdk"

export const getSession = async ({ cookie }: { cookie: string }) => {
  try {
    return await kratosPublic.toSession({
      cookie,
    })
  } catch (error) {
    return error instanceof Error
      ? error
      : new Error("Something went wrong, please try again.")
  }
}
