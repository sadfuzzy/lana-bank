import { useState } from "react"

import { Button } from "@/components/primitive/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/primitive/dialog"
import { Input } from "@/components/primitive/input"
import {
  createPasskeySetup,
  submitPasskeySetupFlow,
} from "@/lib/kratos/public/setup-passkey-flow"
import { signupWithPasskey } from "@/lib/webauth"

export interface AuthenticatorDialogProps {
  open: boolean
  onClose: () => void
  totpSecret: string
  onSubmit: () => void
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  totpCode: string
  error: string | null
}

const SetupWebAuth = () => {
  const [error, setError] = useState<string | null>(null)
  const [webAuthPasskeyName, setWebAuthPasskeyName] = useState<string>("")
  const [openNameWebAuthnDialog, setOpenNameWebAuthnDialog] = useState<boolean>(false)
  const [webAuthData, setWebAuthData] = useState<{
    signupWithPasskeyResponse: string
    flowId: string
    csrfToken: string
  } | null>(null)

  const handlePassKeySetup = async () => {
    const createPasskeySetupResponse = await createPasskeySetup()
    if (createPasskeySetupResponse instanceof Error) {
      setError(createPasskeySetupResponse.message)
      return
    }
    const { webauthnRegisterTrigger, flowId, csrfToken } = createPasskeySetupResponse

    try {
      const { publicKey } = JSON.parse(webauthnRegisterTrigger.slice(33, -1))
      console.log(publicKey)

      const signupWithPasskeyResponse = await signupWithPasskey(publicKey)
      console.log(signupWithPasskeyResponse)

      if (!signupWithPasskeyResponse) {
        setError("Error Adding passkey")
      }

      setWebAuthData({
        signupWithPasskeyResponse: signupWithPasskeyResponse,
        flowId,
        csrfToken,
      })
      setOpenNameWebAuthnDialog(true)
    } catch (error) {
      console.error(error)
      if (error instanceof Error) {
        setError(error.message)
      }
    }
  }

  const validateWebAuthnHandler = async () => {
    if (!webAuthData) {
      return
    }

    const validateWebAuthResponse = await submitPasskeySetupFlow({
      webauthnRegister: webAuthData?.signupWithPasskeyResponse,
      flowId: webAuthData?.flowId,
      csrfToken: webAuthData?.csrfToken,
      webauthnRegisterDisplayname: webAuthPasskeyName,
    })

    if (validateWebAuthResponse instanceof Error) {
      setError(validateWebAuthResponse.message)
      return
    }

    setOpenNameWebAuthnDialog(false)
  }

  return (
    <>
      {error && <p>{error}</p>}
      <Button
        className=" text-left items-start justify-start "
        variant="ghost"
        onClick={handlePassKeySetup}
      >
        Setup PassKey
      </Button>
      <Dialog
        open={openNameWebAuthnDialog}
        onOpenChange={() => {
          setError(null)
          setOpenNameWebAuthnDialog(!openNameWebAuthnDialog)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Name Your Passkey</DialogTitle>
            <DialogDescription>
              This passkey will be identified by the name you assign. You can rename or
              remove it at any time in the future.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={webAuthPasskeyName}
            onChange={(e) => setWebAuthPasskeyName(e.target.value)}
            placeholder="Enter a name for this passkey"
          />
          <DialogFooter>
            <Button onClick={validateWebAuthnHandler} variant="primary">
              Add Passkey
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export { SetupWebAuth }
