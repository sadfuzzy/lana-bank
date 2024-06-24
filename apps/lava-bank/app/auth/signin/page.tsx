import { SignInForm } from "@/components/auth/email-form"
import { AuthTemplateCard } from "@/components/auth/auth-template-card"

async function SignIn() {
  return (
    <AuthTemplateCard>
      <SignInForm />
    </AuthTemplateCard>
  )
}

export default SignIn
