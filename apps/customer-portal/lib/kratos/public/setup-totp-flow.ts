import { AxiosError } from "axios"
import { SettingsFlow, UiNodeInputAttributes, UiNodeTextAttributes } from "@ory/client"

import { kratosPublic } from "../sdk"

interface ExtendedUiNodeTextAttributes extends UiNodeTextAttributes {
  name?: string
}

export const createTotpSetupFlow = async (): Promise<
  | {
      totpSecret: string
      flowId: string
      csrfToken: string
    }
  | Error
> => {
  let data: SettingsFlow

  try {
    data = (await kratosPublic.createBrowserSettingsFlow()).data
  } catch (error) {
    if (error instanceof AxiosError) {
      if (error?.response?.data?.ui?.messages[0]?.text)
        return new Error(error.response.data.ui.messages[0].text)
    }
    return new Error("Unknown error occurred. Please try again.")
  }

  const flowId = data.id
  const totpAttributes = data.ui.nodes.find(
    (node) => (node.attributes as UiNodeTextAttributes).id === "totp_secret_key",
  )

  if (!totpAttributes) return new Error("TOTP attribute not found.")
  const totpSecret = (totpAttributes.attributes as UiNodeTextAttributes).text.text

  const csrfNode = data.ui.nodes.find(
    (node) => (node.attributes as ExtendedUiNodeTextAttributes)?.name === "csrf_token",
  )

  let csrfToken: string | null = null
  if (csrfNode && "value" in csrfNode.attributes)
    csrfToken = (csrfNode.attributes as UiNodeInputAttributes).value

  if (!csrfToken) return new Error("CSRF token not found.")

  return {
    totpSecret,
    flowId,
    csrfToken,
  }
}

export const submitTotpSetupFlow = async ({
  flowId,
  totpCode,
  csrfToken,
}: {
  flowId: string
  totpCode: string
  csrfToken: string
}): Promise<{ success: boolean } | Error> => {
  try {
    await kratosPublic.updateSettingsFlow({
      flow: flowId,
      updateSettingsFlowBody: {
        csrf_token: csrfToken,
        method: "totp",
        totp_code: totpCode,
      },
    })

    return {
      success: true,
    }
  } catch (error) {
    if (error instanceof AxiosError) {
      if (error.response?.status === 400) return new Error("Invalid code")
    }
    return new Error("Unknown error occurred. Please try again.")
  }
}
