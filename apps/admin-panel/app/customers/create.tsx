import React, { useState } from "react"
import { toast } from "sonner"
import { gql } from "@apollo/client"
import { useTranslations } from "next-intl"

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

import { useCustomerCreateMutation, CustomerType } from "@/lib/graphql/generated"
import { useModalNavigation } from "@/hooks/use-modal-navigation"

gql`
  mutation CustomerCreate($input: CustomerCreateInput!) {
    customerCreate(input: $input) {
      customer {
        id
        customerId
        email
        status
        level
        applicantId
      }
    }
  }
`

type FormData = {
  email: string
  telegramId: string
  customerType: CustomerType
}

type CreateCustomerDialogProps = {
  setOpenCreateCustomerDialog: (isOpen: boolean) => void
  openCreateCustomerDialog: boolean
}

const InitialFormData: FormData = {
  email: "",
  telegramId: "",
  customerType: CustomerType.Individual,
}

type FormProps = {
  formData: FormData
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleSubmit: (e: React.FormEvent) => void
  isLoading: boolean
  error: string | null
  setCurrentStep: (step: "details" | "confirmation") => void
  t: ReturnType<typeof useTranslations<"Customers.create">>
}

const DetailsForm = ({
  formData,
  handleInputChange,
  handleSubmit,
  isLoading,
  error,
  t,
}: FormProps) => (
  <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
    <div>
      <Label htmlFor="email">{t("emailLabel")}</Label>
      <Input
        id="email"
        name="email"
        type="email"
        required
        data-testid="customer-create-email"
        placeholder={t("emailPlaceholder")}
        value={formData.email}
        onChange={handleInputChange}
        disabled={isLoading}
      />
    </div>
    <div>
      <Label htmlFor="telegramId">{t("telegramLabel")}</Label>
      <Input
        id="telegramId"
        name="telegramId"
        type="text"
        required
        data-testid="customer-create-telegram-id"
        placeholder={t("telegramPlaceholder")}
        value={formData.telegramId}
        onChange={handleInputChange}
        disabled={isLoading}
      />
    </div>
    <div>
      <Label>{t("customerTypeLabel")}</Label>
      <div className="flex gap-4 mt-2">
        <div className="flex items-center">
          <input
            id="individual"
            name="customerType"
            type="radio"
            value={CustomerType.Individual}
            checked={formData.customerType === CustomerType.Individual}
            onChange={handleInputChange}
            disabled={isLoading}
            className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
            data-testid="customer-type-individual"
          />
          <label htmlFor="individual" className="ml-2 block text-sm">
            {t("individualLabel")}
          </label>
        </div>
        <div className="flex items-center">
          <input
            id="company"
            name="customerType"
            type="radio"
            value={CustomerType.Company}
            checked={formData.customerType === CustomerType.Company}
            onChange={handleInputChange}
            disabled={isLoading}
            className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
            data-testid="customer-type-company"
          />
          <label htmlFor="company" className="ml-2 block text-sm">
            {t("companyLabel")}
          </label>
        </div>
      </div>
    </div>
    {error && <p className="text-destructive">{error}</p>}
    <DialogFooter>
      <Button
        type="submit"
        loading={isLoading}
        data-testid="customer-create-submit-button"
      >
        {t("reviewButton")}
      </Button>
    </DialogFooter>
  </form>
)

const ConfirmationForm = ({
  formData,
  handleSubmit,
  isLoading,
  error,
  setCurrentStep,
  t,
}: FormProps) => (
  <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
    <input
      type="text"
      className="sr-only"
      autoFocus
      onKeyDown={(e) => {
        if (e.key === "Backspace") {
          e.preventDefault()
          setCurrentStep("details")
        }
      }}
    />
    <div>
      <Label>{t("emailLabel")}</Label>
      <p>{formData.email}</p>
    </div>
    <div>
      <Label>{t("telegramLabel")}</Label>
      <p>{formData.telegramId}</p>
    </div>
    <div>
      <Label>{t("customerTypeLabel")}</Label>
      <p>
        {formData.customerType === CustomerType.Individual
          ? t("individualLabel")
          : t("companyLabel")}
      </p>
    </div>
    {error && <p className="text-destructive">{error}</p>}
    <DialogFooter>
      <Button
        variant="ghost"
        onClick={() => setCurrentStep("details")}
        disabled={isLoading}
        type="button"
      >
        {t("backButton")}
      </Button>
      <Button
        type="submit"
        loading={isLoading}
        data-testid="customer-create-submit-button"
      >
        {t("confirmButton")}
      </Button>
    </DialogFooter>
  </form>
)

export const CreateCustomerDialog: React.FC<CreateCustomerDialogProps> = ({
  setOpenCreateCustomerDialog,
  openCreateCustomerDialog,
}) => {
  const t = useTranslations("Customers.create")

  const { navigate, isNavigating } = useModalNavigation({
    closeModal: () => {
      setOpenCreateCustomerDialog(false)
      resetForm()
    },
  })

  const [createCustomer, { loading, reset, error: createCustomerError }] =
    useCustomerCreateMutation({
      update: (cache) => {
        cache.modify({
          fields: {
            customers: (_, { DELETE }) => DELETE,
          },
        })
        cache.gc()
      },
    })

  const isLoading = loading || isNavigating
  const [formData, setFormData] = useState<FormData>(InitialFormData)
  const [error, setError] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState<"details" | "confirmation">("details")

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "customerType"
          ? value === CustomerType.Individual
            ? CustomerType.Individual
            : CustomerType.Company
          : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (currentStep === "details") {
      setCurrentStep("confirmation")
      return
    }

    try {
      await createCustomer({
        variables: {
          input: formData,
        },
        onCompleted: (data) => {
          if (data?.customerCreate.customer) {
            toast.success(t("successMessage"))
            navigate(`/customers/${data.customerCreate.customer.customerId}`)
          } else {
            throw new Error(t("failedToCreate"))
          }
        },
      })
    } catch (error) {
      console.error("Error creating customer:", error)
      if (error instanceof Error) {
        setError(error.message)
      } else if (createCustomerError?.message) {
        setError(createCustomerError.message)
      } else {
        setError(t("unexpectedError"))
      }
      toast.error(t("errorMessage"))
    }
  }

  const resetForm = () => {
    setFormData(InitialFormData)
    setError(null)
    setCurrentStep("details")
  }

  return (
    <Dialog
      open={openCreateCustomerDialog}
      onOpenChange={(isOpen) => {
        setOpenCreateCustomerDialog(isOpen)
        if (!isOpen) {
          resetForm()
          reset()
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {currentStep === "confirmation" ? t("confirmTitle") : t("title")}
          </DialogTitle>
          <DialogDescription>
            {currentStep === "confirmation" ? t("confirmDescription") : t("description")}
          </DialogDescription>
        </DialogHeader>
        {currentStep === "details" ? (
          <DetailsForm
            formData={formData}
            handleInputChange={handleInputChange}
            handleSubmit={handleSubmit}
            isLoading={isLoading}
            error={error}
            setCurrentStep={setCurrentStep}
            t={t}
          />
        ) : (
          <ConfirmationForm
            formData={formData}
            handleInputChange={handleInputChange}
            handleSubmit={handleSubmit}
            isLoading={isLoading}
            error={error}
            setCurrentStep={setCurrentStep}
            t={t}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
