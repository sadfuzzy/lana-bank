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
import { InterestInterval } from "@/lib/graphql/generated"
import { getLoan } from "@/lib/graphql/query/get-loan-details"
import { formatInterval, formatPeriod } from "@/lib/terms/utils"
import { currencyConverter, formatCurrency, formatDate } from "@/lib/utils"

type Props = {
  params: {
    "loan-id": string
  }
}

export default async function LoanDetailsPage({ params }: Props) {
  const { "loan-id": loanId } = params
  const [getLoanResponse] = await Promise.all([getLoan({ variables: { id: loanId } })])

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

  const duration = `${getLoanResponse.loan?.loanTerms?.duration.units} ${formatPeriod(getLoanResponse.loan?.loanTerms.duration.period)}`

  const cvlValues = [
    {
      key: "Margin Call CVL",
      value: `${getLoanResponse.loan?.loanTerms.marginCallCvl}%`,
    },
    {
      key: "Initial Call CVL",
      value: `${getLoanResponse.loan?.loanTerms.initialCvl}%`,
    },
    {
      key: "Liquidation Call CVL",
      value: `${getLoanResponse.loan?.loanTerms.liquidationCvl}%`,
    },
  ]

  const loanOverview = [
    {
      key: "Collateral",
      value: formatCurrency({
        amount: getLoanResponse.loan?.balance.collateral.btcBalance,
        currency: "SATS",
      }),
    },
    {
      key: "Interest Incurred",
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
    { key: "Duration", value: duration },
  ]

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
                {formatDate(getLoanResponse.loan?.createdAt)}
              </p>
            </div>
          </div>
          <div className="flex gap-4 w-full">
            <DetailsCard title="Loan Overview" details={loanOverview} />
            <DetailsCard title="Collateral Value to Loan (CVL)" details={cvlValues} />
          </div>
          <LoanContractTerms
            cvlValues={cvlValues}
            annualRate={getLoanResponse.loan?.loanTerms.annualRate}
            duration={duration}
            interval={getLoanResponse.loan?.loanTerms.interval}
          />
        </CardContent>
      </Card>
    </main>
  )
}

const DetailsCard = ({
  title,
  details,
}: {
  title: string
  details: { key: string; value: string | number }[]
}) => (
  <Card variant="secondary" className="w-1/2">
    <CardHeader>
      <CardTitle>{title}</CardTitle>
    </CardHeader>
    <CardContent className="flex flex-col text-md">
      <KeyValueGroup>
        {details.map(({ key, value }) => (
          <KeyValueCell className="p-0.5 px-3 hover:bg-primary-foreground" key={key}>
            <Key className="text-textColor-secondary text-md">{key}</Key>
            <Value>{value}</Value>
          </KeyValueCell>
        ))}
      </KeyValueGroup>
    </CardContent>
  </Card>
)

const LoanContractTerms = ({
  cvlValues,
  annualRate,
  duration,
  interval,
}: {
  cvlValues: { key: string; value: string | number }[]
  annualRate: number
  duration: string
  interval: InterestInterval | undefined
}) => (
  <Card>
    <CardHeader>
      <CardTitle>Loan Contract Terms</CardTitle>
    </CardHeader>
    <CardContent>
      <ul className="list-disc pl-5">
        <li>Annual Rate: {annualRate}%</li>
        <li>Duration: {duration}</li>
        <li>Interval: {formatInterval(interval)}</li>
      </ul>
    </CardContent>
    <CardContent>
      <p className="mb-2">Collateral Value to Loan (CVL) Details.</p>
      <ul className="list-disc pl-5">
        {cvlValues.map(({ key, value }) => (
          <li key={key}>
            {key}: {value}
          </li>
        ))}
      </ul>
      <p className="mt-6">For questions or support, contact support@lavabank.sv</p>
    </CardContent>
  </Card>
)
