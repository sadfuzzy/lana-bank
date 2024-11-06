"use client"

import { useState, useEffect } from "react"
import { getCsrfToken } from "next-auth/react"

import { Input } from "@/components/new"
import { basePath } from "@/env"
import { Button } from "@/components/primitive/button"

const Login: React.FC = () => {
  const [csrfToken, setCsrfToken] = useState<string | null>(null)
  useEffect(() => {
    getCsrfToken().then((token) => token && setCsrfToken(token))
  })

  return (
    <>
      <h1 className="font-semibold leading-none tracking-tight text-xl">Sign In</h1>
      <div className="space-y-[10px]">
        <div className="text-md">Welcome to Lana Bank Admin Panel</div>
        <div className="text-md font-light">Enter your email address to continue</div>
      </div>
      <form
        className="space-y-[20px] w-full"
        action={`${basePath}/api/auth/signin/email`}
        method="POST"
      >
        <input name="csrfToken" type="hidden" defaultValue={csrfToken || ""} />
        <Input
          label="Your email"
          type="email"
          name="email"
          autofocus
          placeholder="Please enter your email address"
        />
        <Button type="submit">Submit</Button>
      </form>
    </>
  )
}

export default Login
