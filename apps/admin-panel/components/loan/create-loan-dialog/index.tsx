import { gql } from "@apollo/client"

import { useState } from "react"

import { toast } from "sonner"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/primitive/dialog"
import { Input } from "@/components/primitive/input"
import { Label } from "@/components/primitive/label"
import { useLoanCreateMutation } from "@/lib/graphql/generated"
import { Button } from "@/components/primitive/button"
import { currencyConverter, formatCurrency } from "@/lib/utils"
import { DetailItem, DetailsGroup } from "@/components/details"

gql`
  mutation LoanCreate($input: LoanCreateInput!) {
    loanCreate(input: $input) {
      loan {
        id
        loanId
        startDate
        balance {
          collateral {
            btcBalance
          }
          outstanding {
            usdBalance
          }
          interestIncurred {
            usdBalance
          }
        }
      }
    }
  }
`

export const CreateLoanDialog = ({
  userId,
  children,
  refetch,
}: {
  userId: string
  children: React.ReactNode
  refetch?: () => void
}) => {
  const [userIdValue, setUserIdValue] = useState<string>(userId)
  const [desiredPrincipal, setDesiredPrincipal] = useState<number>(0)
  const [createLoan, { data, loading, error, reset }] = useLoanCreateMutation()

  const handleCreateLoan = async () => {
    try {
      await createLoan({
        variables: {
          input: {
            userId: userIdValue,
            desiredPrincipal: currencyConverter.usdToCents(desiredPrincipal),
          },
        },
      })
      toast.success("Loan created successfully")
      if (refetch) refetch()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <Dialog
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          setUserIdValue(userId)
          setDesiredPrincipal(0)
          reset()
        }
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      {data ? (
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Loan Created</DialogTitle>
            <DialogDescription>Loan Details.</DialogDescription>
          </DialogHeader>
          <DetailsGroup>
            <DetailItem label="Loan ID" value={data.loanCreate.loan.loanId} />
            <DetailItem label="Start Date" value={data.loanCreate.loan.startDate} />
            <DetailItem
              label="Collateral"
              value={`${data.loanCreate.loan.balance.collateral.btcBalance} sats`}
            />
            <DetailItem
              label="Interest Incurred"
              value={formatCurrency({
                amount: currencyConverter.centsToUsd(
                  data.loanCreate.loan.balance.interestIncurred.usdBalance,
                ),
                currency: "USD",
              })}
            />
            <DetailItem
              label="Outstanding"
              value={formatCurrency({
                amount: currencyConverter.centsToUsd(
                  data.loanCreate.loan.balance.outstanding.usdBalance,
                ),
                currency: "USD",
              })}
            />
          </DetailsGroup>
        </DialogContent>
      ) : (
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Loan</DialogTitle>
            <DialogDescription>Fill in the details to create a loan.</DialogDescription>
          </DialogHeader>
          <div>
            <Label>User ID</Label>
            <Input
              type="text"
              value={userIdValue}
              onChange={(e) => setUserIdValue(e.target.value)}
              placeholder="Enter the user ID"
            />
          </div>
          <div>
            <Label>Principal</Label>
            <div className="flex items-center gap-1">
              <Input
                type="number"
                value={desiredPrincipal}
                onChange={(e) => setDesiredPrincipal(Number(e.target.value))}
                placeholder="Enter the desired principal amount"
                min={0}
              />
              <div className="p-1.5 bg-input-text rounded-md px-4">USD</div>
            </div>
          </div>
          {error && <span className="text-destructive">{error.message}</span>}
          <DialogFooter className="mt-4">
            <Button className="w-32" disabled={loading} onClick={handleCreateLoan}>
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      )}
    </Dialog>
  )
}
