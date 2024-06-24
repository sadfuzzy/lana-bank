import { redirect } from "next/navigation"

import { cookies } from "next/headers"

import { AuthTemplateCard } from "@/components/auth/auth-template-card"
import { OtpForm } from "@/components/auth/otp-form"
import { authService } from "@/lib/auth"
import { emailParserFromUiNodeLogin, getCsrfCookiesAsString } from "@/lib/auth/utils"

async function SignIn({
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

  const signInFlow = await authService().getLoginFlow({
    flowId,
    cookie: getCsrfCookiesAsString(allCookies),
  })

  if (signInFlow instanceof Error) {
    redirect("/auth")
  }

  const email = await emailParserFromUiNodeLogin(signInFlow.data.ui.nodes)
  if (!email) {
    redirect("/auth")
  }

  return (
    <AuthTemplateCard>
      <OtpForm email={email} flowId={flowId} formType="SIGN_IN" />
    </AuthTemplateCard>
  )
}

export default SignIn
