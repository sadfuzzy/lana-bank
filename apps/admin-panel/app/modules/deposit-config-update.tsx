"use client"

import { gql } from "@apollo/client"
import { Button } from "@lana/web/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@lana/web/ui/dialog"
import { Label } from "@lana/web/ui/label"
import { Input } from "@lana/web/ui/input"
import { useTranslations } from "next-intl"
import { FormEvent, useEffect, useState } from "react"

import {
  DepositConfigDocument,
  DepositModuleConfig,
  DepositModuleConfigureInput,
  useDepositModuleConfigureMutation,
} from "@/lib/graphql/generated"

gql`
  mutation DepositModuleConfigure($input: DepositModuleConfigureInput!) {
    depositModuleConfigure(input: $input) {
      depositConfig {
        chartOfAccountsId
        chartOfAccountsDepositAccountsParentCode
        chartOfAccountsOmnibusParentCode
      }
    }
  }
`

type DepositConfigUpdateDialogProps = {
  setOpen: (isOpen: boolean) => void
  open: boolean
  depositModuleConfig?: DepositModuleConfig
}

const initialFormData = {
  chartOfAccountsDepositAccountsParentCode: "",
  chartOfAccountsOmnibusParentCode: "",
}

export const DepositConfigUpdateDialog: React.FC<DepositConfigUpdateDialogProps> = ({
  open,
  setOpen,
  depositModuleConfig,
}) => {
  const t = useTranslations("Modules")
  const tCommon = useTranslations("Common")

  const [updateDepositConfig, { loading, error, reset }] =
    useDepositModuleConfigureMutation({
      refetchQueries: [DepositConfigDocument],
    })
  const [formData, setFormData] = useState<DepositModuleConfigureInput>(initialFormData)

  const close = () => {
    reset()
    setOpen(false)
    setFormData(initialFormData)
  }

  useEffect(() => {
    if (
      depositModuleConfig &&
      depositModuleConfig.chartOfAccountsDepositAccountsParentCode &&
      depositModuleConfig.chartOfAccountsOmnibusParentCode
    ) {
      setFormData({
        chartOfAccountsDepositAccountsParentCode:
          depositModuleConfig.chartOfAccountsDepositAccountsParentCode,
        chartOfAccountsOmnibusParentCode:
          depositModuleConfig.chartOfAccountsOmnibusParentCode,
      })
    }
  }, [depositModuleConfig])

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    await updateDepositConfig({ variables: { input: formData } })
    close()
  }

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("deposit.setTitle")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit}>
          <div className="flex flex-col space-y-2 w-full">
            {Object.entries(formData).map(([key, value]) => (
              <div key={key}>
                <Label htmlFor={key}>{t(`deposit.${key}`)}</Label>
                <Input
                  id={key}
                  value={value.replace(/\./g, "")}
                  onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                  required={true}
                />
              </div>
            ))}
            {error && <div className="text-destructive">{error.message}</div>}
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={close}>
              {tCommon("cancel")}
            </Button>
            <Button loading={loading} type="submit">
              {tCommon("save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
