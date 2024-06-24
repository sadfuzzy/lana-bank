"use client"

import { useState } from "react"

import { Button } from "@/components/primitive/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/primitive/card"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/primitive/otp-input"
import { Alert, AlertDescription } from "@/components/primitive/alert"
import { submitOtpLogin } from "@/lib/auth/server-actions/submit-otp-login"
import { submitOtpRegister } from "@/lib/auth/server-actions/submit-otp-register"

type FormType = "SIGN_IN" | "REGISTER"

const OtpForm = ({
  formType,
  flowId,
  email,
}: {
  formType: FormType
  flowId: string
  email: string
}) => {
  const [otp, setOtp] = useState("")
  const [error, setError] = useState<string | null>(null)

  const submitOtpHandler = async (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    event.preventDefault()
    if (otp.length !== 6) return
    setError(null)

    if (formType === "SIGN_IN") {
      const response = await submitOtpLogin({ code: otp, flowId, email })
      if (response && response.error?.message) {
        setError(response?.error.message)
      }
    } else {
      const response = await submitOtpRegister({ code: otp, flowId, email })
      if (response && response.error?.message) {
        setError(response.error.message)
      }
    }
  }

  return (
    <Card variant="transparent" className="md:w-2/5">
      <CardHeader className="pt-4">
        <CardTitle>One time Password</CardTitle>
        <CardDescription className="text-textColor-secondary">
          An email has been sent to your email address. Please enter the OTP to continue.
        </CardDescription>
      </CardHeader>
      <form>
        <CardContent>
          <InputOTP value={otp} onChange={(value) => setOtp(value)} maxLength={6}>
            <InputOTPGroup className="w-full">
              <InputOTPSlot className="w-1/6 h-12" index={0} />
              <InputOTPSlot className="w-1/6 h-12" index={1} />
              <InputOTPSlot className="w-1/6 h-12" index={2} />
              <InputOTPSlot className="w-1/6 h-12" index={3} />
              <InputOTPSlot className="w-1/6 h-12" index={4} />
              <InputOTPSlot className="w-1/6 h-12" index={5} />
            </InputOTPGroup>
          </InputOTP>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button
            type="submit"
            className="rounded-full w-full"
            onClick={submitOtpHandler}
          >
            Submit
          </Button>
          {error && (
            <Alert variant="destructive" className="mt-1 p-3">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardFooter>
      </form>
    </Card>
  )
}

export { OtpForm }
