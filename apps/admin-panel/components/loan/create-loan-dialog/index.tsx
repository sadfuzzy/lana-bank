import { gql } from "@apollo/client"
import { useState, useRef } from "react"
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
import { InterestInterval, Period, useLoanCreateMutation } from "@/lib/graphql/generated"
import { Button } from "@/components/primitive/button"
import { currencyConverter, formatCurrency, formatDate } from "@/lib/utils"
import { DetailItem, DetailsGroup } from "@/components/details"
import { Select } from "@/components/primitive/select"
import { formatInterval, formatPeriod } from "@/lib/terms/utils"

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
        loanTerms {
          annualRate
          interval
          liquidationCvl
          marginCallCvl
          initialCvl
          duration {
            period
            units
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

  const desiredPrincipalRef = useRef<HTMLInputElement>(null)
  const annualRateRef = useRef<HTMLInputElement>(null)
  const intervalRef = useRef<HTMLSelectElement>(null)
  const liquidationCvlRef = useRef<HTMLInputElement>(null)
  const marginCallCvlRef = useRef<HTMLInputElement>(null)
  const initialCvlRef = useRef<HTMLInputElement>(null)
  const durationUnitsRef = useRef<HTMLInputElement>(null)
  const durationPeriodRef = useRef<HTMLSelectElement>(null)

  const [createLoan, { data, loading, error, reset }] = useLoanCreateMutation()

  const handleCreateLoan = async (event: React.FormEvent) => {
    event.preventDefault()

    const desiredPrincipal = desiredPrincipalRef.current?.value
    const annualRate = annualRateRef.current?.value
    const interval = intervalRef.current?.value
    const liquidationCvl = liquidationCvlRef.current?.value
    const marginCallCvl = marginCallCvlRef.current?.value
    const initialCvl = initialCvlRef.current?.value
    const durationUnits = durationUnitsRef.current?.value
    const durationPeriod = durationPeriodRef.current?.value

    if (
      !desiredPrincipal ||
      !annualRate ||
      !interval ||
      !liquidationCvl ||
      !marginCallCvl ||
      !initialCvl ||
      !durationUnits ||
      !durationPeriod
    ) {
      toast.error("Please fill in all the fields.")
      return
    }

    try {
      await createLoan({
        variables: {
          input: {
            userId: userIdValue,
            desiredPrincipal: currencyConverter.usdToCents(Number(desiredPrincipal)),
            loanTerms: {
              annualRate: parseFloat(annualRate),
              interval: interval as InterestInterval,
              liquidationCvl: parseFloat(liquidationCvl),
              marginCallCvl: parseFloat(marginCallCvl),
              initialCvl: parseFloat(initialCvl),
              duration: {
                units: parseInt(durationUnits),
                period: durationPeriod as Period,
              },
            },
          },
        },
      })
      toast.success("Loan created successfully")
      if (refetch) refetch()
    } catch (err) {
      console.error(err)
    }
  }

  const resetForm = () => {
    if (desiredPrincipalRef.current) desiredPrincipalRef.current.value = ""
    if (annualRateRef.current) annualRateRef.current.value = ""
    if (intervalRef.current) intervalRef.current.value = ""
    if (liquidationCvlRef.current) liquidationCvlRef.current.value = ""
    if (marginCallCvlRef.current) marginCallCvlRef.current.value = ""
    if (initialCvlRef.current) initialCvlRef.current.value = ""
    if (durationUnitsRef.current) durationUnitsRef.current.value = ""
    if (durationPeriodRef.current) durationPeriodRef.current.value = ""
  }

  return (
    <Dialog
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          setUserIdValue(userId)
          resetForm()
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
            <DetailItem
              label="Start Date"
              value={formatDate(data.loanCreate.loan.startDate)}
            />
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
            <DetailItem
              label="Duration"
              value={`${String(data.loanCreate.loan.loanTerms.duration.units)} ${formatPeriod(data.loanCreate.loan.loanTerms.duration.period)}`}
            />
            <DetailItem
              label="Interval"
              value={formatInterval(data.loanCreate.loan.loanTerms.interval)}
            />
            <DetailItem
              label="Annual Rate"
              value={`${data.loanCreate.loan.loanTerms.annualRate}%`}
            />
            <DetailItem
              label="Liquidation CVL"
              value={`${data.loanCreate.loan.loanTerms.liquidationCvl}%`}
            />
            <DetailItem
              label="Margin Call CVL"
              value={`${data.loanCreate.loan.loanTerms.marginCallCvl}%`}
            />
            <DetailItem
              label="Initial CVL"
              value={`${data.loanCreate.loan.loanTerms.initialCvl}%`}
            />
          </DetailsGroup>
        </DialogContent>
      ) : (
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Loan</DialogTitle>
            <DialogDescription>Fill in the details to create a loan.</DialogDescription>
          </DialogHeader>
          <form className="flex flex-col gap-4" onSubmit={handleCreateLoan}>
            <div>
              <Label>Principal</Label>
              <div className="flex items-center gap-1">
                <Input
                  type="number"
                  ref={desiredPrincipalRef}
                  placeholder="Enter the desired principal amount"
                  min={0}
                  required
                />
                <div className="p-1.5 bg-input-text rounded-md px-4">USD</div>
              </div>
            </div>
            <div>
              <Label>Margin Call CVL</Label>
              <Input
                type="number"
                ref={marginCallCvlRef}
                placeholder="Enter the margin call CVL"
                required
              />
            </div>
            <div>
              <Label>Initial CVL</Label>
              <Input
                type="number"
                ref={initialCvlRef}
                placeholder="Enter the initial CVL"
                required
              />
            </div>
            <div>
              <Label>Liquidation CVL</Label>
              <Input
                type="number"
                ref={liquidationCvlRef}
                placeholder="Enter the liquidation CVL"
                min={0}
                required
              />
            </div>
            <div>
              <Label>Duration</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  ref={durationUnitsRef}
                  placeholder="Duration"
                  min={0}
                  required
                  className="w-1/2"
                />
                <Select ref={durationPeriodRef} required defaultValue="">
                  <option value="" disabled>
                    Select period
                  </option>
                  {Object.values(Period).map((period) => (
                    <option key={period} value={period}>
                      {formatPeriod(period)}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
            <div>
              <Label>Interval</Label>
              <Select ref={intervalRef} required defaultValue="">
                <option value="" disabled>
                  Select interval
                </option>
                {Object.values(InterestInterval).map((interval) => (
                  <option key={interval} value={interval}>
                    {formatInterval(interval)}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Annual Rate</Label>
              <Input
                type="number"
                ref={annualRateRef}
                placeholder="Enter the annual rate"
                required
              />
            </div>
            {error && <span className="text-destructive">{error.message}</span>}
            <DialogFooter className="mt-4">
              <Button className="w-32" disabled={loading} type="submit">
                Create New Loan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      )}
    </Dialog>
  )
}
