import { AxiosError } from "axios"

import { kratosPublic } from "../sdk"

export const toSession = async ({ cookie }: { cookie: string }) => {
  try {
    const { data } = await kratosPublic().toSession({
      cookie,
    })
    return data
  } catch (error) {
    if (error instanceof AxiosError) {
      console.log(error.response?.data)
    }
    return new Error("Something went wrong, please try again")
  }
}
