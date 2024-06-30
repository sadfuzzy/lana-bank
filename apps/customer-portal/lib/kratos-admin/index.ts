import { Configuration, Identity, IdentityApi } from "@ory/client"

import { env } from "@/env"

export const kratosAdmin = () => {
  const kratosAdmin = new IdentityApi(
    new Configuration({ basePath: env.KRATOS_ADMIN_API }),
  )

  const getIdentityCredentials = async (
    id: string,
  ): Promise<Identity["credentials"] | undefined | Error> => {
    try {
      const response = await kratosAdmin.getIdentity({ id })

      if (!response.data.credentials) {
        return new Error("No credentials found")
      }

      return response.data.credentials
    } catch (error) {
      return error instanceof Error
        ? error
        : new Error("Something went wrong, please try again.")
    }
  }

  return {
    getIdentityCredentials,
  }
}
