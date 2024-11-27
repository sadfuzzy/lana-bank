import type { Meta, StoryObj } from "@storybook/react"
import { MockedProvider } from "@apollo/client/testing"

import CreditFacilityPage from "./page"

import faker from "@/.storybook/faker"

import {
  GetCreditFacilityDetailsDocument,
  CollateralizationState,
  CreditFacilityStatus,
} from "@/lib/graphql/generated"
import {
  mockCreditFacility,
  mockCreditFacilityIncrementalPayment,
  mockCreditFacilityDisbursal,
} from "@/lib/graphql/generated/mocks"
import { Satoshis, UsdCents } from "@/types"

interface CreditFacilityStoryArgs {
  facilityAmount: number
  collateral: number
  numberOfDisbursals: number
  numberOfTransactions: number
  showEmptyDisbursals: boolean
  status: CreditFacilityStatus
  collateralizationState: string
}

const DEFAULT_ARGS: CreditFacilityStoryArgs = {
  facilityAmount: faker.number.int({ min: 10000, max: 1000000 }),
  collateral: faker.number.int({ min: 1, max: 100 }),
  numberOfDisbursals: faker.number.int({ min: 1, max: 5 }),
  numberOfTransactions: faker.number.int({ min: 5, max: 10 }),
  showEmptyDisbursals: false,
  status: CreditFacilityStatus.Active,
  collateralizationState: "Healthy",
}

const createTransactions = (args: CreditFacilityStoryArgs) => {
  if (args.numberOfTransactions === 0) return []
  const transactionTypes = [() => mockCreditFacilityIncrementalPayment()]
  return Array.from({ length: args.numberOfTransactions }, () =>
    faker.helpers.arrayElement(transactionTypes)(),
  )
}

const createDisbursals = (args: CreditFacilityStoryArgs) => {
  if (args.showEmptyDisbursals) return []
  return Array.from({ length: args.numberOfDisbursals }, () =>
    mockCreditFacilityDisbursal(),
  )
}

const createMocks = (args: CreditFacilityStoryArgs, creditFacilityId: string) => [
  {
    request: {
      query: GetCreditFacilityDetailsDocument,
      variables: { id: creditFacilityId },
    },
    result: {
      data: {
        creditFacility: mockCreditFacility({
          facilityAmount: args.facilityAmount as UsdCents,
          collateral: args.collateral as Satoshis,
          status: args.status,
          collateralizationState: args.collateralizationState as CollateralizationState,
          disbursals: createDisbursals(args),
          transactions: createTransactions(args),
        }),
      },
    },
  },
]

const CreditFacilityStory = (args: CreditFacilityStoryArgs) => {
  const creditFacilityId = faker.string.uuid()
  const mocks = createMocks(args, creditFacilityId)

  return (
    <MockedProvider mocks={mocks} addTypename={false} key={JSON.stringify(args)}>
      <CreditFacilityPage params={{ "credit-facility-id": creditFacilityId }} />
    </MockedProvider>
  )
}

const meta: Meta<typeof CreditFacilityStory> = {
  title: "Pages/CreditFacilities/CreditFacility/Details",
  component: CreditFacilityStory,
  parameters: { layout: "fullscreen", nextjs: { appDirectory: true } },
  argTypes: {
    facilityAmount: {
      control: { type: "number", min: 1000, max: 1000000 },
      description: "Facility amount in cents",
    },
    collateral: {
      control: { type: "number", min: 1, max: 100 },
      description: "Collateral amount in BTC",
    },
    numberOfDisbursals: {
      control: { type: "number", min: 0, max: 10 },
      description: "Number of disbursals to display",
    },
    numberOfTransactions: {
      control: { type: "number", min: 0, max: 20 },
      description: "Number of transactions to display",
    },
    showEmptyDisbursals: {
      control: "boolean",
      description: "Show empty state for disbursals",
    },
    status: {
      control: "select",
      options: ["Active", "Pending", "Completed", "Denied"],
      description: "Credit facility status",
    },
    collateralizationState: {
      control: "select",
      options: ["Healthy", "MarginCall", "Liquidated"],
      description: "Collateralization state",
    },
  },
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = { args: DEFAULT_ARGS }
