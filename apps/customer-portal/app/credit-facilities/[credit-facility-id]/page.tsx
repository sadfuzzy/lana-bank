import { gql } from "@apollo/client"

import { DetailItemProps, DetailsCard } from "@lana/web/components/details"

import Link from "next/link"

import { ArrowLeft } from "lucide-react"

import FacilityCard from "./facility-card"

import CollateralCard from "./collateral-card"

import TermsCard from "./terms-card"

import { CreditFacilityTransactions } from "./transactions"

import { LoanAndCreditFacilityStatusBadge } from "@/app/credit-facility"

import { getCreditFacility } from "@/lib/graphql/query/get-cf"
import { removeUnderscore } from "@/lib/kratos/utils"
import { formatDate } from "@/lib/utils"

gql`
  query GetCreditFacility {
    me {
      customer {
        creditFacilities {
          id
          creditFacilityId
          facilityAmount
          collateral
          collateralizationState
          status
          createdAt
          activatedAt
          expiresAt
          creditFacilityTerms {
            annualRate
            accrualInterval
            incurrenceInterval
            oneTimeFeeRate
            duration {
              period
              units
            }
            liquidationCvl
            marginCallCvl
            initialCvl
          }
          balance {
            facilityRemaining {
              usdBalance
            }
            disbursed {
              total {
                usdBalance
              }
              outstanding {
                usdBalance
              }
              dueOutstanding {
                usdBalance
              }
            }
            interest {
              total {
                usdBalance
              }
              outstanding {
                usdBalance
              }
              dueOutstanding {
                usdBalance
              }
            }
            collateral {
              btcBalance
            }
            dueOutstanding {
              usdBalance
            }
            outstanding {
              usdBalance
            }
          }
          currentCvl {
            total
            disbursed
          }
          transactions {
            ... on CreditFacilityIncrementalPayment {
              cents
              recordedAt
              txId
            }
            ... on CreditFacilityCollateralUpdated {
              satoshis
              recordedAt
              action
              txId
            }
            ... on CreditFacilityOrigination {
              cents
              recordedAt
              txId
            }
            ... on CreditFacilityCollateralizationUpdated {
              state
              collateral
              outstandingInterest
              outstandingDisbursal
              recordedAt
              price
            }
            ... on CreditFacilityDisbursalExecuted {
              cents
              recordedAt
              txId
            }
            ... on CreditFacilityInterestAccrued {
              cents
              recordedAt
              txId
              days
            }
          }
        }
      }
    }
  }
`

async function page({ params }: { params: { "credit-facility-id": string } }) {
  const id = params["credit-facility-id"]
  const data = await getCreditFacility({
    id,
  })

  if (!data || data instanceof Error) {
    return <div>Not found</div>
  }

  const details: DetailItemProps[] = [
    {
      label: "Created At",
      value: formatDate(data.createdAt),
    },
    {
      label: "Collateralization State",
      value: removeUnderscore(data.collateralizationState),
    },
    {
      label: "Expires At",
      value: data.expiresAt || "N/A",
    },
    {
      label: "Status",
      value: (
        <LoanAndCreditFacilityStatusBadge
          data-testid="credit-facility-status-badge"
          status={data.status}
        />
      ),
    },
  ]

  return (
    <main className="px-2 flex flex-col gap-2 max-w-7xl mx-auto">
      <DetailsCard
        title={
          <div className="flex items-center gap-2">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <span className="text-md font-semibold">Credit Facility</span>
          </div>
        }
        details={details}
      />
      <div className="flex flex-col gap-2 md:flex-row">
        <FacilityCard data={data} />
        <CollateralCard data={data} />
      </div>
      <TermsCard data={data} />
      <CreditFacilityTransactions creditFacility={data} />
    </main>
  )
}

export default page
