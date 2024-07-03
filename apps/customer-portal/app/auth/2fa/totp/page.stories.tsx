import React from "react"

import TwoFactorAuthWithTotpPage from "@/app/auth/2fa/totp/page"
import { AuthTemplateCard } from "@/components/auth/auth-template-card"
import { TotpForm } from "@/components/auth/totp-form"

export default {
  title: "pages/auth/2fa/totp",
  component: TwoFactorAuthWithTotpPage,
}

export const Default = () => (
  <AuthTemplateCard>
    <TotpForm flowId={"flow-id"} />
  </AuthTemplateCard>
)
