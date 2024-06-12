"use client"
import React, { useRef, useState } from "react"

import { useRouter } from "next/navigation"

import { Button } from "../primitive/button"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../primitive/dialog"
import { Input } from "../primitive/input"
import { Label } from "../primitive/label"

import { withdrawalSettleServerAction } from "@/app/user/[user-id]/server-actions"

const WithdrawalSettle = ({
  open,
  setOpen,
}: {
  open: boolean
  setOpen: (value: boolean) => void
}) => {
  const withdrawalIdRef = useRef<HTMLInputElement>(null)
  const referenceRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [response, setResponse] = useState<string | null>(null)
  const router = useRouter()

  const handleOpenChange = (value: boolean) => {
    setOpen(value)
    if (!value) {
      setError(null)
      setResponse(null)
      if (withdrawalIdRef.current) withdrawalIdRef.current.value = ""
      if (referenceRef.current) referenceRef.current.value = ""
    }
  }

  const handleSubmit = async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.preventDefault()
    setError(null)
    setResponse(null)
    setLoading(true)
    const withdrawalId = withdrawalIdRef.current ? withdrawalIdRef.current.value : null
    const reference = referenceRef.current ? referenceRef.current.value : null

    if (!withdrawalId || !reference) {
      setError("Invalid Input")
      setLoading(false)
      return
    }

    const response = await withdrawalSettleServerAction({
      reference,
      withdrawalId,
    })

    if (response.error) {
      setError(response.message)
    } else {
      router.refresh()
      setResponse(response.message)
    }

    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Withdrawal Settle</DialogTitle>
        </DialogHeader>
        {loading ? (
          <p>Loading...</p>
        ) : response ? (
          <p>{response}</p>
        ) : (
          <>
            <div>
              <Label htmlFor="withdrawal-id">Withdrawal ID</Label>
              <Input
                ref={withdrawalIdRef}
                id="withdrawal-id"
                name="withdrawal-id"
                placeholder="Please enter withdrawal ID"
              />
            </div>
            <div>
              <Label htmlFor="reference">Reference</Label>
              <Input
                ref={referenceRef}
                id="reference"
                name="reference"
                placeholder="Please enter reference"
              />
            </div>
            {error && <p>{error}</p>}
          </>
        )}
        {!response && <Button onClick={handleSubmit}>Submit</Button>}
      </DialogContent>
    </Dialog>
  )
}

export default WithdrawalSettle
