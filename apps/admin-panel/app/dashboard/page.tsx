"use client"

import { gql } from "@apollo/client"

import ActionsList from "../actions/list"

import DashboardCard from "./card"
import CollateralUsdChart from "./collateral-usd-chart"

import { Skeleton } from "@/components/primitive/skeleton"

import {
  useDashboardQuery,
  useGetRealtimePriceUpdatesQuery,
} from "@/lib/graphql/generated"
import Balance from "@/components/balance/balance"
import { currencyConverter } from "@/lib/utils"

gql`
  query Dashboard {
    dashboard {
      activeFacilities
      pendingFacilities
      totalDisbursed
      totalCollateral
    }
  }
`
const CardSkeleton = () => (
  <div className="w-full p-6 border rounded-lg">
    <div className="space-y-2">
      <div className="flex items-end gap-2">
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-6 w-12" />
      </div>
      <Skeleton className="h-6 w-32" />
      <Skeleton className="h-4 w-48" />
    </div>
    <div className="mt-4">
      <Skeleton className="h-9 w-28" />
    </div>
  </div>
)

const Dashboard = () => {
  const { data, loading } = useDashboardQuery({
    fetchPolicy: "no-cache",
  })
  const { data: priceData } = useGetRealtimePriceUpdatesQuery({
    fetchPolicy: "cache-only",
  })

  const totalCollateralSats = data?.dashboard.totalCollateral
  const totalDisbursedUsdCents = data?.dashboard.totalDisbursed

  const totalCollateralUsdCents =
    priceData?.realtimePrice?.usdCentsPerBtc && totalCollateralSats
      ? currencyConverter.satoshiToBtc(
          priceData.realtimePrice.usdCentsPerBtc * totalCollateralSats,
        )
      : 0

  const dummyCollateralUsdData = [
    { value: 6000000, date: new Date(2023, 0, 1) },
    { value: 4500000, date: new Date(2023, 1, 1) },
    { value: 5000000, date: new Date(2023, 2, 1) },
    { value: 7000000, date: new Date(2023, 3, 1) },
    { value: 6500000, date: new Date(2023, 4, 1) },
    { value: 8000000, date: new Date(2023, 5, 1) },
    { value: 7500000, date: new Date(2023, 6, 1) },
    { value: 8200000, date: new Date(2023, 7, 1) },
    { value: 7800000, date: new Date(2023, 8, 1) },
    { value: 8300000, date: new Date(2023, 9, 1) },
    { value: 8100000, date: new Date(2023, 10, 1) },
    { value: 8500000, date: new Date(2023, 11, 1) },
  ]

  return (
    <div className="w-full h-full flex flex-col gap-2">
      <div className="relative w-full flex flex-col justify-center items-start">
        {/* <TimeRangeSelect range={range} setRange={setRange} /> */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 w-full">
          {loading ? (
            <>
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </>
          ) : (
            <>
              <DashboardCard
                h1={data?.dashboard.activeFacilities}
                h2={data?.dashboard.pendingFacilities}
                h2PopupDescription="Pending Facilities"
                title="Active Facilities"
                description="Credit Facilities where money has been disbursed"
                to="/credit-facilities?filter=active"
              />
              <DashboardCard
                h1={<Balance currency="usd" amount={totalDisbursedUsdCents} />}
                title="Total Disbursed"
                description="Total amount of money customers withdrew from the bank"
                to="/disbursals"
              />
              <DashboardCard
                h1={<Balance currency="usd" amount={totalCollateralUsdCents} />}
                h2={<Balance currency="btc" amount={totalCollateralSats} />}
                title="Total Collateral"
                description="Total bitcoin collateral value at market rate that the bank holds"
                to="/credit-facilities"
              />
            </>
          )}
        </div>

        <div className="mt-[10px] w-full grid grid-cols-1 lg:grid-cols-2 gap-2">
          <DashboardCard
            title="Collateral / USD Graph"
            description="History of bank-held collateral and its USD market value at the time."
            content={<CollateralUsdChart data={dummyCollateralUsdData} />}
          />
          <DashboardCard
            title="CVL Distribution"
            description="This shows loans and facilities with risk levels: red for collateral below liquidation threshold, yellow for collateral below margin call threshold, and green for sufficient collateral."
            to="/credit-facilities?sort=cvl&direction=asc"
            buttonToRight
            buttonText="View Risky Loans"
            content={
              <div className="flex w-full h-full min-h-48">
                {/* Red Section */}
                <div className="flex flex-col items-center justify-center w-full bg-red-100">
                  <div className="text-2xl font-bold text-red-600">24%</div>
                  <div className="text-sm text-red-600/90">$10.2k</div>
                </div>

                {/* Yellow Section */}
                <div className="flex flex-col items-center justify-center w-full bg-yellow-100">
                  <div className="text-2xl font-bold text-yellow-600">12.7%</div>
                  <div className="text-sm text-yellow-600/90">$3.3k</div>
                </div>

                {/* Green Section */}
                <div className="flex flex-col items-center justify-center w-full bg-green-100">
                  <div className="text-2xl font-bold text-green-600">63.3%</div>
                  <div className="text-sm text-green-600/90">$29k</div>
                </div>
              </div>
            }
          />
        </div>
      </div>
      <ActionsList dashboard />
    </div>
  )
}

export default Dashboard
