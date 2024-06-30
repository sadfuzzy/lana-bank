import QRCode from "react-qr-code"
import { useState } from "react"

import { Button } from "@/components/primitive/button"
import { CopyButton } from "@/components/primitive/copy-button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/primitive/dialog"
import { Input } from "@/components/primitive/input"
import {
  createTotpSetupFlow,
  submitTotpSetupFlow,
} from "@/lib/kratos/public/setup-totp-flow"

export interface AuthenticatorDialogProps {
  open: boolean
  onClose: () => void
  totpSecret: string
  onSubmit: () => void
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  totpCode: string
  error: string | null
}

export const AuthenticatorDialog: React.FC<AuthenticatorDialogProps> = ({
  open,
  onClose,
  totpSecret,
  onSubmit,
  onChange,
  totpCode,
  error,
}) => (
  <Dialog
    open={open}
    onOpenChange={() => {
      onClose()
    }}
  >
    <DialogContent className="max-w-96">
      <DialogHeader className="flex flex-col space-y-1.5 text-center">
        <DialogTitle className="text-center">Setup Authenticator</DialogTitle>
        <DialogDescription className="text-center">
          Scan the QR code with your authenticator app and enter the code below
        </DialogDescription>
      </DialogHeader>
      <div className="flex flex-col justify-center items-center gap-4">
        <div className="flex justify-center items-center bg-white p-4 rounded-lg">
          <QRCode size={200} value={totpSecret || ""} />
        </div>
        <div className="bg-secondary-foreground p-1 rounded-md px-2 flex gap-2 items-center">
          <p className="text-textColor-secondary text-xs">{totpSecret}</p>
          <CopyButton value={totpSecret} />
        </div>
        <Input
          value={totpCode}
          onChange={onChange}
          placeholder="Enter the code from your authenticator app"
        />
        <Button className="w-full" onClick={onSubmit}>
          Submit
        </Button>
        {error && <p className="text-red-500">{error}</p>}
      </div>
    </DialogContent>
  </Dialog>
)

const SetupAuthenticator = () => {
  const [totpCode, setTotpCode] = useState<string>("")
  const [error, setError] = useState<string | null>(null)
  const [openTotpDialog, setOpenTotpDialog] = useState<boolean>(false)
  const [flowData, setFlowData] = useState<{
    flowId: string
    totpSecret: string
    csrfToken: string
  } | null>(null)

  const handleTotpSetup = async () => {
    const response = await createTotpSetupFlow()

    if (response instanceof Error) {
      setError(response.message)
      return
    }

    const { flowId, totpSecret, csrfToken } = response
    setFlowData({
      flowId,
      totpSecret,
      csrfToken,
    })
    setOpenTotpDialog(true)
  }

  const handleSubmitTotp = async () => {
    if (!flowData || !totpCode) {
      return
    }

    const response = await submitTotpSetupFlow({
      flowId: flowData.flowId,
      totpCode,
      csrfToken: flowData.csrfToken,
    })

    if (response instanceof Error) {
      setError(response.message)
      return
    }

    if (response.success) {
      setOpenTotpDialog(false)
    }
  }

  return (
    <>
      <Button onClick={handleTotpSetup}>Setup Authenticator App</Button>
      {flowData && (
        <AuthenticatorDialog
          open={openTotpDialog}
          onClose={() => {
            setError(null)
            setTotpCode("")
            setOpenTotpDialog(!openTotpDialog)
          }}
          totpSecret={flowData.totpSecret}
          onSubmit={handleSubmitTotp}
          onChange={(e) => setTotpCode(e.target.value)}
          totpCode={totpCode}
          error={error}
        />
      )}
    </>
  )
}

export { SetupAuthenticator }
