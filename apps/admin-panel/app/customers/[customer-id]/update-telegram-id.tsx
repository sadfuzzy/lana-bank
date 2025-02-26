"use client"

import React, { useState } from "react"
import { gql } from "@apollo/client"
import { useTranslations } from "next-intl"
import { toast } from "sonner"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@lana/web/ui/dialog"
import { Input } from "@lana/web/ui/input"
import { Button } from "@lana/web/ui/button"
import { Label } from "@lana/web/ui/label"

import { useCustomerUpdateMutation } from "@/lib/graphql/generated"

gql`
  mutation CustomerUpdate($input: CustomerUpdateInput!) {
    customerUpdate(input: $input) {
      customer {
        id
        telegramId
      }
    }
  }
`

type UpdateTelegramIdDialogProps = {
  setOpenUpdateTelegramIdDialog: (isOpen: boolean) => void
  openUpdateTelegramIdDialog: boolean
  customerId: string
}

export const UpdateTelegramIdDialog: React.FC<UpdateTelegramIdDialogProps> = ({
  setOpenUpdateTelegramIdDialog,
  openUpdateTelegramIdDialog,
  customerId,
}) => {
  const t = useTranslations("Customers.CustomerDetails.updateTelegram")

  const [updateTelegramId, { loading, error: mutationError, reset }] =
    useCustomerUpdateMutation()
  const [newTelegramId, setNewTelegramId] = useState<string>("")
  const [validationError, setValidationError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError(null)

    if (!newTelegramId.trim()) {
      setValidationError(t("errors.emptyTelegramId"))
      return
    }

    try {
      await updateTelegramId({
        variables: {
          input: {
            customerId,
            telegramId: newTelegramId.trim(),
          },
        },
      })
      toast.success(t("messages.updateSuccess"))
      setOpenUpdateTelegramIdDialog(false)
    } catch (error) {
      console.error(error)
      if (error instanceof Error) {
        toast.error(t("errors.updateFailed", { error: error.message }))
      } else {
        toast.error(t("errors.unexpected"))
      }
    }
  }

  const resetStates = () => {
    setNewTelegramId("")
    setValidationError(null)
    reset()
  }

  return (
    <Dialog
      open={openUpdateTelegramIdDialog}
      onOpenChange={(isOpen) => {
        setOpenUpdateTelegramIdDialog(isOpen)
        if (!isOpen) {
          resetStates()
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="newTelegramId">{t("labels.newTelegramId")}</Label>
            <Input
              id="newTelegramId"
              type="text"
              required
              placeholder={t("placeholders.newTelegramId")}
              value={newTelegramId}
              onChange={(e) => setNewTelegramId(e.target.value)}
            />
          </div>
          {(validationError || mutationError) && (
            <p className="text-destructive">
              {validationError || mutationError?.message || t("errors.unexpected")}
            </p>
          )}
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? t("actions.updating") : t("actions.update")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default UpdateTelegramIdDialog
