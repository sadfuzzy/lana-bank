import { redirect } from "next/navigation"

import { cookies } from "next/headers"

import { AuthTemplateCard } from "@/components/auth/auth-template-card"
import { OtpForm } from "@/components/auth/otp-form"
import { authService } from "@/lib/auth"
import { emailParserFromUiNodeRegister, getCsrfCookiesAsString } from "@/lib/auth/utils"

async function RegisterOtp({
  searchParams,
}: {
  searchParams: {
    flow?: string
  }
}) {
  const flowId = searchParams?.flow
  const csrfToken = cookies().get("csrfToken")?.value
  const allCookies = cookies().getAll()

  if (!flowId || !csrfToken) {
    redirect("/auth")
  }

  const registerFlow = await authService().getRegistrationFlow({
    flowId,
    cookie: await getCsrfCookiesAsString(allCookies),
  })

  if (registerFlow instanceof Error) {
    redirect("/auth")
  }

  const email = await emailParserFromUiNodeRegister(registerFlow.data.ui.nodes)
  if (!email) {
    redirect("/auth")
  }

  return (
    <AuthTemplateCard>
      <OtpForm email={email} flowId={flowId} formType="REGISTER" />
    </AuthTemplateCard>
  )
}

export default RegisterOtp
