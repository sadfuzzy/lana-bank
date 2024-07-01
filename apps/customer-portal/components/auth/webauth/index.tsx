"use client"

import { useEffect, useState } from "react"

import { useRouter } from "next/navigation"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/primitive/card"
import {
  SerializedPublicKeyCredentialRequestOptions,
  signinWithPasskey,
} from "@/lib/webauth"
import { Button } from "@/components/primitive/button"
import { Alert, AlertDescription } from "@/components/primitive/alert"
import { submitWebAuthnFow } from "@/lib/kratos/public/submit-webauthn"

const PasskeySignIn = ({
  flowId,
  publicKey,
  email,
  csrfToken,
}: {
  flowId: string
  publicKey: SerializedPublicKeyCredentialRequestOptions
  email: string
  csrfToken: string
}) => {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  const startWebAuth = async () => {
    const signinWithPasskeyResponse = await signinWithPasskey(publicKey)
    const submitWebAuthResponse = await submitWebAuthnFow({
      flowId,
      webAuthLogin: signinWithPasskeyResponse,
      email,
      csrfToken,
    })

    if (submitWebAuthResponse instanceof Error) {
      setError(submitWebAuthResponse.message)
      return
    }

    router.replace("/")
  }

  useEffect(() => {
    startWebAuth()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Card variant="transparent" className="md:w-2/5">
      <CardHeader className="pt-4">
        <CardTitle>Continue With Passkey</CardTitle>
        <CardDescription className="text-textColor-secondary">
          Connect your Passkey to sign in.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          variant="primary"
          onClick={startWebAuth}
          className="align-middle w-30 items-center min-h-max"
        >
          Sign in with Passkey
        </Button>
      </CardContent>

      <CardFooter className="flex flex-col gap-2">
        {error && (
          <Alert variant="destructive" className="mt-1 p-3">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardFooter>
    </Card>
  )
}

export { PasskeySignIn }
