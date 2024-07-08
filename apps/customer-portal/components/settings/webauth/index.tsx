"use client"
import { useState } from "react"

import { toast } from "sonner"

import { UiNode } from "@ory/client"

import { useRouter } from "next/navigation"

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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/primitive/table"
import { AddIcon, TrashIcon } from "@/components/icons"

export interface AuthenticatorDialogProps {
  open: boolean
  onClose: () => void
  totpSecret: string
  onSubmit: () => void
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  totpCode: string
  error: string | null
}

const SetupWebAuth = ({ addedWebAuthNode }: { addedWebAuthNode: UiNode[] }) => {
  const router = useRouter()

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
      toast.error(createPasskeySetupResponse.message)
      return
    }
    const { webauthnRegisterTrigger, flowId, csrfToken } = createPasskeySetupResponse

    try {
      const { publicKey } = JSON.parse(webauthnRegisterTrigger.slice(33, -1))
      console.log(publicKey)

      const signupWithPasskeyResponse = await signupWithPasskey(publicKey)
      console.log(signupWithPasskeyResponse)

      if (!signupWithPasskeyResponse) {
        toast.error("Error Adding passkey")
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
        toast.error(error.message)
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
      toast.error(validateWebAuthResponse.message)
      return
    }

    toast.success("Passkey added successfully")
    setOpenNameWebAuthnDialog(false)
    router.refresh()
  }

  return (
    <>
      <div className="flex justify-between items-center align-middle">
        <p className="font-semibold leading-none tracking-tight">Setup PassKey</p>
        <Button
          className="text-left items-start justify-start"
          onClick={handlePassKeySetup}
        >
          <AddIcon className="w-5 h-5" />
          <p>Add New</p>
        </Button>
      </div>
      <Dialog
        open={openNameWebAuthnDialog}
        onOpenChange={() => {
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
      {addedWebAuthNode.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {addedWebAuthNode.map((node) => {
              console.log(node)
              return (
                <TableRow key={node?.meta?.label?.id}>
                  <TableCell className="font-medium">
                    {/* TODO add appropriate type for this */}
                    {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
                    {/* @ts-ignore */}
                    {node.meta.label?.context?.display_name}
                  </TableCell>
                  {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
                  {/* @ts-ignore */}
                  <TableCell>{node.meta.label?.context?.added_at}</TableCell>
                  <TableCell className="text-right flex justify-end items-end">
                    <TrashIcon
                      className="w-6 h-6 p-1 hover:bg-destructive transition-all rounded-md"
                      onClick={() => {
                        toast.info("feature not implemented yet")
                      }}
                    />
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      )}
    </>
  )
}

export { SetupWebAuth }
