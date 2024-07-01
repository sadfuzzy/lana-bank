import { LoginFlow, UiNode, UiNodeInputAttributes } from "@ory/client"

import { AxiosError } from "axios"

import { kratosPublic } from "@/lib/kratos/sdk"

import {
  emailParserFromUiNodeLogin,
  emailParserFromUiNodeRegister,
  getCsrfToken,
} from "@/lib/kratos/utils"

type SubmitAuthData = {
  flowId: string
  otp: string
  type: "login" | "register"
}
export const submitAuthFlow = async ({ flowId, otp, type }: SubmitAuthData) => {
  if (type === "register") {
    const flow = await kratosPublic.getRegistrationFlow({ id: flowId })

    const csrf_token = getCsrfToken(flow.data)
    if (!csrf_token) throw new Error("Kratos API didn't send CSRF token")

    const { data } = await kratosPublic.updateRegistrationFlow({
      flow: flowId,
      updateRegistrationFlowBody: {
        method: "code",
        code: otp,
        traits: {
          email: emailParserFromUiNodeRegister(flow.data.ui.nodes),
        },
        csrf_token,
      },
    })

    return data
  } else if (type === "login") {
    const flow = await kratosPublic.getLoginFlow({ id: flowId })

    const csrf_token = getCsrfToken(flow.data)
    if (!csrf_token) throw new Error("Kratos API didn't send CSRF token")

    const email = emailParserFromUiNodeLogin(flow.data.ui.nodes)
    if (!email) throw new Error("Email not found in the flow")

    const { data } = await kratosPublic.updateLoginFlow({
      flow: flowId,
      updateLoginFlowBody: {
        method: "code",
        code: otp,
        identifier: email,
        csrf_token,
      },
    })

    return data
  }
}

export const checkIfTwoFactorRequired = async () => {
  let data: LoginFlow

  try {
    data = (
      await kratosPublic.createBrowserLoginFlow({
        aal: "aal2",
      })
    ).data
  } catch (error) {
    if (error instanceof AxiosError) {
      return new Error(
        error.response?.data?.ui?.messages[0]?.text ||
          "Something went wrong, please try again.",
      )
    }
    return new Error("Unknown error occurred. Please try again.")
  }

  const userHasTotp =
    data.ui.nodes.find((node: UiNode) => {
      if (node.group === "totp") {
        const attributes = node.attributes as UiNodeInputAttributes
        return attributes.name === "method"
      }
      return false
    }) !== undefined

  const userHasWebAuth =
    data.ui.nodes.find((node: UiNode) => {
      if (node.group === "webauthn") {
        const attributes = node.attributes as UiNodeInputAttributes
        return attributes.name === "webauthn_login_trigger"
      }
      return false
    }) !== undefined

  return {
    flowId: data.id,
    userHasTotp,
    userHasWebAuth,
  }
}
