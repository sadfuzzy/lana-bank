import { redirect } from "next/navigation"

import { AuthTemplateCard } from "@/components/auth/auth-template-card"
import { TotpForm } from "@/components/auth/totp-form"

async function TwoFactorAuthWithTotpPage({
  searchParams,
}: {
  searchParams: {
    flowId?: string
  }
}) {
  if (!searchParams.flowId) redirect("/auth")
  const { flowId } = searchParams

  return (
    <AuthTemplateCard>
      <TotpForm flowId={flowId} />
    </AuthTemplateCard>
  )
}
export default TwoFactorAuthWithTotpPage
