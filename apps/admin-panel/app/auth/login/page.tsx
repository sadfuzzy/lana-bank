"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import { loginUser } from "../ory"

import { Input } from "@/components/input"
import { Button } from "@/ui/button"

const Login: React.FC = () => {
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [error, setError] = useState("")

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")

    try {
      const flowId = await loginUser(email)
      router.push(`/auth/verify?flow=${flowId}`)
    } catch {
      setError("Please check your credentials and try again.")
    }
  }

  return (
    <>
      <h1 className="font-semibold leading-none tracking-tight text-xl">Sign In</h1>
      <div className="space-y-[10px]">
        <div className="text-md">Welcome to Lana Bank Admin Panel</div>
        <div className="text-md font-light">Enter your email address to continue</div>
      </div>
      <form className="space-y-[20px] w-full" onSubmit={onSubmit}>
        <Input
          label="Your email"
          type="email"
          name="email"
          autofocus
          placeholder="Please enter your email address"
          defaultValue={email}
          onChange={setEmail}
        />
        <Button type="submit">Submit</Button>
        {error && <div className="text-destructive">{error}</div>}
      </form>
    </>
  )
}

export default Login
