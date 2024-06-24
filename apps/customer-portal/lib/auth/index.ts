import { getLoginFlow } from "@/lib/auth/api/get-login-flow"
import { getRegistrationFlow } from "@/lib/auth/api/get-registration-flow"
import { getSession } from "@/lib/auth/api/get-session"
import { startSignInFlow } from "@/lib/auth/api/start-login-flow"
import { startRegisterFlow } from "@/lib/auth/api/start-register-flow"
import { verifyEmailCodeLoginFlow } from "@/lib/auth/api/verify-login-code-flow"
import { verifyEmailCodeRegisterFlow } from "@/lib/auth/api/verify-register-code-flow"

export const authService = () => {
  return {
    startRegisterFlow,
    startSignInFlow,
    verifyEmailCodeLoginFlow,
    verifyEmailCodeRegisterFlow,
    getLoginFlow,
    getRegistrationFlow,
    getSession,
  }
}
