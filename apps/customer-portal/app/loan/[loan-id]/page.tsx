import { LoanIcon } from "@/components/icons"
import { Alert } from "@/components/primitive/alert"
import {
  Key,
  KeyValueCell,
  KeyValueGroup,
  Value,
} from "@/components/primitive/aligned-key-value"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/primitive/card"

import { getLoan } from "@/lib/graphql/query/get-loan-details"
import { currencyConverter, formatCurrency, formatDate } from "@/lib/utils"

type Props = {
  params: {
    "loan-id": string
  }
}

export default async function LoanDetailsPage({ params }: Props) {
  const { "loan-id": loanId } = params
  const getLoanResponse = await getLoan({
    variables: {
      id: loanId,
    },
  })

  if (getLoanResponse instanceof Error) {
    return (
      <main className="max-w-[70rem] m-auto mt-10">
        <Card>
          <CardHeader>
            <CardTitle>ERROR!</CardTitle>
            <CardDescription>Something went wrong</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">{getLoanResponse.message}</Alert>
          </CardContent>
        </Card>
      </main>
    )
  }

  return (
    <main className="max-w-[70rem] m-auto mt-10">
      <Card className="flex-col h-full">
        <CardHeader>
          <div className="flex align-middle items-center gap-4">
            <LoanIcon className="hidden md:block w-10 h-10" />
            <div className="flex flex-col gap-2">
              <CardTitle className="mt-2">Loan Details</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className="ml-8 gap-4 flex flex-col mt-2">
          <div className="flex justify-between">
            <div>
              <p className="text-sm">Details</p>
              <p className="font-semibold text-lg">
                Loan #{getLoanResponse.loan?.loanId}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm">Refresh Print Export</p>
              <p className="font-semibold text-lg">
                {formatDate(getLoanResponse.loan?.startDate)}
              </p>
            </div>
          </div>
          <div className="flex gap-4 w-full">
            <LoanOverviewCard
              details={[
                {
                  key: "Collateral",
                  value: formatCurrency({
                    amount: getLoanResponse.loan?.balance.collateral.btcBalance,
                    currency: "SATS",
                  }),
                },
                {
                  key: "interest Incurred",
                  value: formatCurrency({
                    amount: currencyConverter.centsToUsd(
                      getLoanResponse.loan?.balance.interestIncurred.usdBalance,
                    ),
                    currency: "USD",
                  }),
                },
                {
                  key: "Outstanding",
                  value: formatCurrency({
                    amount: currencyConverter.centsToUsd(
                      getLoanResponse.loan?.balance.outstanding.usdBalance,
                    ),
                    currency: "USD",
                  }),
                },
              ]}
            />
          </div>
        </CardContent>
      </Card>
    </main>
  )
}

const LoanOverviewCard = ({
  details,
}: {
  details: {
    key: string
    value: string | number
  }[]
}) => {
  return (
    <Card variant="secondary" className="w-full">
      <CardHeader>
        <CardTitle>Loan Overview</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col text-md">
        <KeyValueGroup>
          {details.map(({ key, value }) => (
            <KeyValueCell className="p-0.5 px-3 hover:bg-primary-foreground" key={key}>
              <Key className="text-textColor-primary text-md">{key}</Key>
              <Value>{value}</Value>
            </KeyValueCell>
          ))}
        </KeyValueGroup>
      </CardContent>
    </Card>
  )
}
