"use client"
import React, { useRef, useState } from "react"

import { useRouter } from "next/navigation"

import { Button } from "../primitive/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../primitive/dialog"
import { Input } from "../primitive/input"
import { Label } from "../primitive/label"

import { userDepositServerAction } from "@/app/user/[user-id]/server-actions"

const UpdateDeposit = ({
  userId,
  open,
  setOpen,
}: {
  userId?: string
  open: boolean
  setOpen: (value: boolean) => void
}) => {
  const amountRef = useRef<HTMLInputElement>(null)
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
      if (amountRef.current) amountRef.current.value = ""
      if (referenceRef.current) referenceRef.current.value = ""
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setResponse(null)
    setLoading(true)
    const amount = amountRef.current ? parseInt(amountRef.current.value, 10) : null
    const reference = referenceRef.current ? referenceRef.current.value : null

    if (!amount || !reference || !userId) {
      setError("Invalid Input")
      setLoading(false)
      return
    }

    const response = await userDepositServerAction({
      userId,
      amount,
      reference,
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
          <DialogTitle>User Deposit</DialogTitle>
        </DialogHeader>
        {loading ? (
          <p>Loading...</p>
        ) : response ? (
          <p>{response}</p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
            <div>
              <Label htmlFor="user-id">User ID</Label>
              <Input id="user-id" name="user-id" defaultValue={userId} />
            </div>
            <div>
              <Label htmlFor="amount">Amount in USD</Label>
              <Input
                ref={amountRef}
                id="amount"
                name="amount"
                min="0"
                type="number"
                placeholder="Please enter amount in USD"
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
            {!response && <Button type="submit">Submit</Button>}
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default UpdateDeposit
