import { cva, VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const BTC_PER_SATOSHI = 100000000
const USD_PER_CENT = 100

const formatAmount = (amount: number, currency: Currency) => {
  const formatter = new Intl.NumberFormat("en-US")

  switch (currency) {
    case "btc": {
      const btc = Math.floor(amount / BTC_PER_SATOSHI)
      const sats = amount % BTC_PER_SATOSHI
      return `${formatter.format(btc)}.${sats.toString().padStart(8, "0")}`
    }
    case "usd": {
      const dollars = Math.floor(amount / USD_PER_CENT)
      const cents = amount % USD_PER_CENT
      return `${formatter.format(dollars)}.${cents.toString().padStart(2, "0")}`
    }
  }
}

export type Currency = "btc" | "usd"

type BalanceProps = {
  amount: number
  currency: Currency
  className?: string
} & VariantProps<typeof balanceVariants>

const balanceVariants = cva("", {
  variants: {
    align: {
      end: "flex justify-end space-x-1",
      start: "flex justify-start space-x-1",
      center: "flex justify-center space-x-1",
      right: "flex justify-right space-x-1",
    },
  },
})

const Balance: React.FC<BalanceProps> = ({ amount, currency, className, align }) => {
  const isNegative = amount < 0
  const formattedAmount = formatAmount(Math.abs(amount), currency)
  const formattedAmountWithSymbol = isNegative
    ? `(${formattedAmount})`
    : `${formattedAmount}`

  return (
    <div className={cn(balanceVariants({ align }), "flex gap-0.5", className)}>
      {currency === "usd" && <div>$</div>}
      <div className="font-mono">
        {formattedAmountWithSymbol}
        {currency === "btc" && " BTC"}
      </div>
    </div>
  )
}
export default Balance
