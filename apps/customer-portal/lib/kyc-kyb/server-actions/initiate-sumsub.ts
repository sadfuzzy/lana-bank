"use server"

import { sumSubPermalinkCreate } from "@/lib/graphql/mutation/sumsub-permalink-create"
import { sumSubTokenCreate } from "@/lib/graphql/mutation/sumsub-token-create"

export const initiateKycKyb = async (): Promise<
  ServerActionResponse<{
    token: string
  }>
> => {
  const sumSubTokenCreateResponse = await sumSubTokenCreate()

  if (sumSubTokenCreateResponse instanceof Error) {
    return {
      data: null,
      error: {
        message: sumSubTokenCreateResponse.message,
      },
    }
  }

  return {
    data: {
      token: sumSubTokenCreateResponse.sumsubTokenCreate.token,
    },
    error: null,
  }
}

export const generateKycPermalink = async (): Promise<
  ServerActionResponse<{
    permalink: string
  }>
> => {
  const sumSubPermalinkCreateResponse = await sumSubPermalinkCreate()
  if (sumSubPermalinkCreateResponse instanceof Error) {
    return {
      data: null,
      error: {
        message: sumSubPermalinkCreateResponse.message,
      },
    }
  }

  return {
    data: {
      permalink: sumSubPermalinkCreateResponse.sumsubPermalinkCreate.url,
    },
    error: null,
  }
}
