import React, { useState } from "react"
import { toast } from "sonner"
import { gql } from "@apollo/client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/ui/dialog"
import { useCustomerCreateMutation } from "@/lib/graphql/generated"
import { Input } from "@/ui/input"
import { Button } from "@/ui/button"
import { Label } from "@/ui/label"
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
}

type CreateCustomerDialogProps = {
  setOpenCreateCustomerDialog: (isOpen: boolean) => void
  openCreateCustomerDialog: boolean
}

const InitialFormData: FormData = {
  email: "",
  telegramId: "",
}

type FormProps = {
  formData: FormData
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleSubmit: (e: React.FormEvent) => void
  isLoading: boolean
  error: string | null
  setCurrentStep: (step: "details" | "confirmation") => void
}

const DetailsForm = ({
  formData,
  handleInputChange,
  handleSubmit,
  isLoading,
  error,
}: FormProps) => (
  <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
    <div>
      <Label htmlFor="email">Email</Label>
      <Input
        id="email"
        name="email"
        type="email"
        required
        data-testid="customer-create-email"
        placeholder="Please enter the email address"
        value={formData.email}
        onChange={handleInputChange}
        disabled={isLoading}
      />
    </div>
    <div>
      <Label htmlFor="telegramId">Telegram ID</Label>
      <Input
        id="telegramId"
        name="telegramId"
        type="text"
        required
        data-testid="customer-create-telegram-id"
        placeholder="Please enter the Telegram ID"
        value={formData.telegramId}
        onChange={handleInputChange}
        disabled={isLoading}
      />
    </div>
    {error && <p className="text-destructive">{error}</p>}
    <DialogFooter>
      <Button
        type="submit"
        loading={isLoading}
        data-testid="customer-create-submit-button"
      >
        Review Details
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
      <Label>Email</Label>
      <p>{formData.email}</p>
    </div>
    <div>
      <Label>Telegram ID</Label>
      <p>{formData.telegramId}</p>
    </div>
    {error && <p className="text-destructive">{error}</p>}
    <DialogFooter>
      <Button
        variant="ghost"
        onClick={() => setCurrentStep("details")}
        disabled={isLoading}
        type="button"
      >
        Back
      </Button>
      <Button
        type="submit"
        loading={isLoading}
        data-testid="customer-create-submit-button"
      >
        Confirm and Submit
      </Button>
    </DialogFooter>
  </form>
)

export const CreateCustomerDialog: React.FC<CreateCustomerDialogProps> = ({
  setOpenCreateCustomerDialog,
  openCreateCustomerDialog,
}) => {
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
      [name]: value,
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
            toast.success("Customer created successfully")
            navigate(`/customers/${data.customerCreate.customer.customerId}`)
          } else {
            throw new Error("Failed to create customer. Please try again.")
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
        setError("An unexpected error occurred. Please try again.")
      }
      toast.error("Failed to create customer")
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
            {currentStep === "confirmation"
              ? "Confirm Customer Details"
              : "Add new customer"}
          </DialogTitle>
          <DialogDescription>
            {currentStep === "confirmation"
              ? "Please review the details before submitting"
              : "Add a new Customer by providing their email address and Telegram ID"}
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
          />
        ) : (
          <ConfirmationForm
            formData={formData}
            handleInputChange={handleInputChange}
            handleSubmit={handleSubmit}
            isLoading={isLoading}
            error={error}
            setCurrentStep={setCurrentStep}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
