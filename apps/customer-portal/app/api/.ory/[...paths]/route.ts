import { createApiHandler } from "@ory/integrations/next-edge"

const handler = createApiHandler({
  forwardAdditionalHeaders: ["x-forwarded-host"],
})

export { handler as GET, handler as POST }
export { config } from "@ory/integrations/next-edge"
