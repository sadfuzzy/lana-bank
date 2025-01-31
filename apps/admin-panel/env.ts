import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

export const env = createEnv({
  shared: {
    NEXT_PUBLIC_CORE_ADMIN_URL: z
      .string()
      .url()
      .default("http://localhost:4455/admin/graphql"),

    NEXT_PUBLIC_BASE_PATH: z.string().default("/"),
  },
  client: {
    NEXT_PUBLIC_APP_VERSION: z.string().default("0.0.0-dev"),
  },
  runtimeEnv: {
    NEXT_PUBLIC_CORE_ADMIN_URL: process.env.NEXT_PUBLIC_CORE_ADMIN_URL,
    NEXT_PUBLIC_BASE_PATH: process.env.NEXT_PUBLIC_BASE_PATH,
    NEXT_PUBLIC_APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION,
  },
})

export const basePath = env.NEXT_PUBLIC_BASE_PATH === "/" ? "" : env.NEXT_PUBLIC_BASE_PATH
