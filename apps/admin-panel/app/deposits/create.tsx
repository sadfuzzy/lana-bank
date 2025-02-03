import React, { useState } from "react"
import { gql, useApolloClient } from "@apollo/client"
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

import { useCreateContext } from "../create"

import {
  GetCustomerOverviewDocument,
  useCreateDepositMutation,
} from "@/lib/graphql/generated"
import { currencyConverter } from "@/lib/utils"

gql`
  mutation CreateDeposit($input: DepositRecordInput!) {
    depositRecord(input: $input) {
      deposit {
        ...DepositFields
        account {
          customer {
            id
            customerId
            depositAccount {
              id
              deposits {
                ...DepositFields
              }
            }
            depositAccount {
              id
              balance {
                settled
                pending
              }
            }
          }
        }
      }
    }
  }
`

type CreateDepositDialgProps = {
  setOpenCreateDepositDialog: (isOpen: boolean) => void
  openCreateDepositDialog: boolean
  depositAccountId: string
}

export const CreateDepositDialog: React.FC<CreateDepositDialgProps> = ({
  setOpenCreateDepositDialog,
  openCreateDepositDialog,
  depositAccountId,
}) => {
  const [createDeposit, { loading, reset }] = useCreateDepositMutation({
    update: (cache) => {
      cache.modify({
        fields: {
          deposits: (_, { DELETE }) => DELETE,
        },
      })
      cache.gc()
    },
  })
  const [amount, setAmount] = useState<string>("")
  const [reference, setReference] = useState<string>("")
  const [error, setError] = useState<string | null>(null)
  const client = useApolloClient()
  const { customer } = useCreateContext()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      const result = await createDeposit({
        variables: {
          input: {
            depositAccountId,
            amount: currencyConverter.usdToCents(parseFloat(amount)),
            reference,
          },
        },
      })
      if (result.data) {
        await client.query({
          query: GetCustomerOverviewDocument,
          variables: {
            id: result.data.depositRecord.deposit.account.customer.customerId,
          },
          fetchPolicy: "network-only",
        })

        toast.success("Deposit created successfully")
        handleCloseDialog()
      } else {
        throw new Error("No data returned from mutation")
      }
    } catch (error) {
      console.error("Error creating deposit:", error)
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError("An unknown error occurred")
      }
    }
  }

  const resetStates = () => {
    setAmount("")
    setReference("")
    setError(null)
    reset()
  }

  const handleCloseDialog = () => {
    setOpenCreateDepositDialog(false)
    resetStates()
  }

  return (
    <Dialog open={openCreateDepositDialog} onOpenChange={handleCloseDialog}>
      <DialogContent>
        <div
          className="absolute -top-6 -left-[1px] bg-primary rounded-tl-md rounded-tr-md text-md px-2 py-1 text-secondary"
          style={{ width: "100.35%" }}
        >
          Creating deposit for {customer?.email}
        </div>
        <DialogHeader className="mt-4">
          <DialogTitle>Create Deposit</DialogTitle>
          <DialogDescription>
            Provide the required details to create a deposit.
          </DialogDescription>
        </DialogHeader>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="amount">Amount</Label>
            <div className="flex items-center gap-1">
              <Input
                data-testid="deposit-amount-input"
                id="amount"
                type="number"
                required
                placeholder="Enter the deposit amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <div className="p-1.5 bg-input-text rounded-md px-4">USD</div>
            </div>
          </div>
          <div>
            <Label htmlFor="reference">Reference</Label>
            <Input
              id="reference"
              type="text"
              placeholder="Enter a reference (optional)"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
            />
          </div>
          {error && <p className="text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="submit" disabled={loading} data-testid="deposit-submit-button">
              {loading ? "Submitting..." : "Submit"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
