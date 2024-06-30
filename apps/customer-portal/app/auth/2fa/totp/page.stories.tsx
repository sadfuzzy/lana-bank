import React from "react"

import TwoFactorAuthPage from "@/app/auth/2fa/totp/page"
import { AuthTemplateCard } from "@/components/auth/auth-template-card"
import { TotpForm } from "@/components/auth/totp-form"

export default {
  title: "pages/auth/2fa",
  component: TwoFactorAuthPage,
}

export const Default = () => (
  <AuthTemplateCard>
    <TotpForm flowId={"flow-id"} />
  </AuthTemplateCard>
)
