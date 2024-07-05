"use client"
import React, { useState } from "react"
import SumsubWebSdk from "@sumsub/websdk-react"

import { toast } from "sonner"

import { Checkbox } from "../primitive/check-box"
import { Label } from "../primitive/label"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../primitive/dialog"

import { Button } from "../primitive/button"

import { CopyButton } from "../primitive/copy-button"
import { Separator } from "../primitive/separator"

import {
  generateKycPermalink,
  initiateKycKyb,
} from "@/lib/kyc-kyb/server-actions/initiate-sumsub"

function KycKybWrapper({ kycCompleted }: { kycCompleted: boolean }) {
  const [token, setToken] = useState<null | string>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [permalink, setPermalink] = useState<null | string>(null)

  const initiateKycKybHandler = async () => {
    if (kycCompleted) return toast.info("KYC or KYB onboarding already completed")

    const initiateKycKybResponse = await initiateKycKyb()
    if (initiateKycKybResponse.error) {
      toast.error(initiateKycKybResponse.error.message)
      return
    }

    setToken(initiateKycKybResponse.data.token)
  }

  const generateKycPermalinkHandler = async () => {
    const generateKycPermalinkResponse = await generateKycPermalink()
    if (generateKycPermalinkResponse.error) {
      toast.error(generateKycPermalinkResponse.error.message)
      return
    }

    setPermalink(generateKycPermalinkResponse.data.permalink)
  }

  return (
    <>
      <div onClick={() => setIsDialogOpen(true)} className="flex gap-2 items-center">
        <Checkbox checked={kycCompleted} />
        <Label className="hover:underline">Complete KYC or KYB onboarding</Label>
      </div>
      {
        <Dialog
          open={isDialogOpen}
          onOpenChange={() => {
            setIsDialogOpen(false)
            setToken(null)
            setPermalink(null)
          }}
        >
          <DialogContent
            onInteractOutside={(event) => event.preventDefault()}
            className="p-6 flex flex-col justify-center align-middle items-center"
          >
            <DialogHeader>
              <DialogTitle className="text-center">
                Complete Your KYC Verification
              </DialogTitle>
              <DialogDescription className="text-center">
                Proceed with your verification to unlock account features and start your
                onboarding process.
              </DialogDescription>
            </DialogHeader>
            {token ? (
              <SumsubWebSdk
                onError={(error: string) => {
                  toast.error(error)
                }}
                expirationHandler={() => {
                  toast.error(
                    "Your KYC verification session has expired. Please try again.",
                  )
                }}
                accessToken={token}
              />
            ) : (
              <Button className="w-40" onClick={initiateKycKybHandler}>
                Start Now
              </Button>
            )}
            <div className="flex justify-center align-middle items-center gap-4">
              <Separator />
              <p className="text-textColor-secondary text-xs">or</p>
              <Separator />
            </div>
            {permalink ? (
              <div className="bg-secondary-foreground p-1 rounded-md px-2 flex gap-2 items-center">
                <p className="text-sm text-textColor-secondary">{permalink}</p>
                <CopyButton value={permalink} />
              </div>
            ) : (
              <Button
                className="w-40"
                onClick={generateKycPermalinkHandler}
                variant="secondary"
              >
                Generate Link
              </Button>
            )}
          </DialogContent>
        </Dialog>
      }
    </>
  )
}

export { KycKybWrapper }
