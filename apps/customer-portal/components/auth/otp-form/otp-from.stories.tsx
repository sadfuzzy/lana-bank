import React from "react"

import { OtpForm } from "@/components/auth/otp-form"

export default {
  title: "components/Auth/otp-form",
  component: OtpForm,
}

export const SignInOTP = () => (
  <OtpForm email="test" flowId="flow-id" formType="SIGN_IN" />
)

export const RegisterOTP = () => (
  <OtpForm email="test" flowId="flow-id" formType="REGISTER" />
)
