import { AxiosError } from "axios"
import { UiNodeInputAttributes, UiNodeTextAttributes, SettingsFlow } from "@ory/client"

import { kratosPublic } from "@/lib/kratos/sdk"

interface ExtendedUiNodeTextAttributes extends UiNodeTextAttributes {
  name?: string
}

export const createPasskeySetup = async (): Promise<
  | {
      webauthnRegisterTrigger: string
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
  const webauthnRegisterTriggerNode = data.ui.nodes.find(
    (node) =>
      (node.attributes as ExtendedUiNodeTextAttributes)?.name ===
      "webauthn_register_trigger",
  )

  let webauthnRegisterTrigger: string | undefined
  if (
    webauthnRegisterTriggerNode &&
    "onclick" in webauthnRegisterTriggerNode.attributes
  ) {
    webauthnRegisterTrigger = (
      webauthnRegisterTriggerNode.attributes as UiNodeInputAttributes
    ).onclick
  }

  const csrfNode = data.ui.nodes.find(
    (node) => (node.attributes as ExtendedUiNodeTextAttributes)?.name === "csrf_token",
  )

  let csrfToken: string | null = null
  if (csrfNode && "value" in csrfNode.attributes) {
    csrfToken = (csrfNode.attributes as UiNodeInputAttributes).value
  }

  if (!webauthnRegisterTrigger || !csrfToken) return new Error("Webauthn setup failed")

  return { webauthnRegisterTrigger, flowId, csrfToken }
}

export const submitPasskeySetupFlow = async ({
  flowId,
  csrfToken,
  webauthnRegister,
  webauthnRegisterDisplayname,
}: {
  flowId: string
  csrfToken: string
  webauthnRegister: string
  webauthnRegisterDisplayname: string
}): Promise<{ success: boolean } | Error> => {
  const method = "webauthn"
  try {
    await kratosPublic.updateSettingsFlow({
      flow: flowId,
      updateSettingsFlowBody: {
        method,
        csrf_token: csrfToken,
        webauthn_register: webauthnRegister,
        webauthn_register_displayname: webauthnRegisterDisplayname,
      },
    })
    return {
      success: true,
    }
  } catch (error) {
    if (error instanceof AxiosError) {
      if (error.response?.status === 400) return new Error("Invalid Action")
    }
    return new Error("Unknown error occurred. Please try again.")
  }
}
