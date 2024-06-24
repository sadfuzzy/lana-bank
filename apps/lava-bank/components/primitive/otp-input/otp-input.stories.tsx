import React from "react"

import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/primitive/otp-input"

export default {
  title: "Components/otp-input",
  component: InputOTP,
}

export const Default = () => (
  <InputOTP maxLength={6}>
    <InputOTPGroup className="w-full">
      {Array.from({ length: 6 }).map((_, index) => (
        <InputOTPSlot key={index} index={index} />
      ))}
    </InputOTPGroup>
  </InputOTP>
)
