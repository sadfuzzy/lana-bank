import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

export const env = createEnv({
  shared: {
    NEXT_PUBLIC_CORE_URL: z.string().url().default("http://localhost:5252"),
  },
  runtimeEnv: {
    NEXT_PUBLIC_CORE_URL: process.env.NEXT_PUBLIC_CORE_URL,
  },
})
