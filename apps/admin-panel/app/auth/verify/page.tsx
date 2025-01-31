"use client"

import React, { useState, Suspense, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

import { loginUserWithOtp } from "../ory"

import { Button } from "@/ui/button"
import { Input } from "@/components/input"

const Verify: React.FC = () => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [otp, setOtp] = useState("")
  const [error, setError] = useState("")
  const formRef = React.useRef<HTMLFormElement>(null)

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    try {
      const flowId = searchParams.get("flow") || ""
      await loginUserWithOtp(flowId, otp)
      router.push("/dashboard")
    } catch {
      setError("Entered OTP is incorrect or has expired, please try again")
    }
  }

  useEffect(() => {
    if (otp.length === 6) {
      formRef.current?.requestSubmit()
    }
  }, [otp])

  return (
    <>
      <h1 className="font-semibold leading-none tracking-tight text-xl">
        A verification email has been sent
      </h1>
      <div className="space-y-[10px]">
        <div className="text-md">Enter the 6 digit OTP</div>
        <div className="text-md font-light">
          Check your email address to continue. We&apos;ve sent a six digit OTP to your
          inbox. Enter the exact digits in the box below to continue.
        </div>
      </div>
      <form ref={formRef} className="space-y-[20px] w-full" onSubmit={onSubmit}>
        <Input
          label="One Time Code"
          type="text"
          name="otp"
          autofocus
          placeholder="Please enter the OTP sent to your email"
          defaultValue={otp}
          onChange={setOtp}
        />
        <Button type="submit">Submit</Button>
        {error && <div className="text-destructive">{error}</div>}
      </form>
    </>
  )
}

const VerifyPage: React.FC = () => (
  <Suspense>
    <Verify />
  </Suspense>
)

export default VerifyPage
