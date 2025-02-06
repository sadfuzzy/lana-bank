import { Configuration, FrontendApi } from "@ory/client"

import axios from "axios"

import { basePath } from "@/env"

export const kratosPublic = () =>
  new FrontendApi(
    new Configuration({
      basePath,
      baseOptions: {
        withCredentials: true,
        timeout: 10000,
      },
    }),
    "",
    axios,
  )
