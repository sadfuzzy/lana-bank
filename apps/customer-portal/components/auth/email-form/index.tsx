"use client"
import { useRef, useState } from "react"
import { z } from "zod"

import { Button } from "@/components/primitive/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/primitive/card"
import { Input } from "@/components/primitive/input"
import { Alert, AlertDescription } from "@/components/primitive/alert"
import { createLoginOrRegisterFlow } from "@/lib/auth/server-actions/create-login-or-register-flow"

const emailSchema = z.string().email({ message: "Invalid email address" })

const SignInForm = () => {
  const emailRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (emailRef.current && emailRef.current.value) {
      setError(null)
      const result = emailSchema.safeParse(emailRef.current.value)
      if (!result.success) {
        setError(result.error.errors[0].message)
        return
      }
      const response = await createLoginOrRegisterFlow({
        email: emailRef.current.value,
      })

      if (response && response.error?.message) {
        setError(response.error.message)
      }
    }
  }

  return (
    <Card variant="transparent" className="md:w-2/5">
      <CardHeader className="pt-4">
        <CardTitle>Create an Account / Sign-in</CardTitle>
        <CardDescription className="text-textColor-secondary">
          Getting started is easy. Simply enter and confirm your email address.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <Input type="email" ref={emailRef} placeholder="Please enter email" />
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button type="submit" className="rounded-full px-6 w-full">
            Next
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

export { SignInForm }
