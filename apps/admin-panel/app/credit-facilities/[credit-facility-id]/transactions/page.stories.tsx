import type { Meta, StoryObj } from "@storybook/react"
import { MockedProvider } from "@apollo/client/testing"

import CreditFacilityLayout from "../layout"

import CreditFacilityTransactionsPage from "./page"

import {
  CollateralAction,
  GetCreditFacilityBasicDetailsDocument,
  GetCreditFacilityTransactionsDocument,
} from "@/lib/graphql/generated"
import {
  mockCreditFacility,
  mockCreditFacilityIncrementalPayment,
  mockCreditFacilityCollateralUpdated,
  mockCreditFacilityInterestAccrued,
  mockCreditFacilityDisbursalExecuted,
} from "@/lib/graphql/generated/mocks"

const meta = {
  title: "Pages/CreditFacilities/CreditFacility/Transactions",
  component: CreditFacilityTransactionsPage,
  parameters: {
    layout: "fullscreen",
    nextjs: {
      appDirectory: true,
    },
  },
} satisfies Meta<typeof CreditFacilityTransactionsPage>

export default meta
type Story = StoryObj<typeof meta>

const mockParams = { "credit-facility-id": "test-id" }

const layoutMocks = [
  {
    request: {
      query: GetCreditFacilityBasicDetailsDocument,
      variables: {
        id: "test-id",
      },
    },
    result: {
      data: {
        creditFacility: mockCreditFacility({
          id: "test-id",
        }),
      },
    },
  },
]

const transactionsMocks = [
  {
    request: {
      query: GetCreditFacilityTransactionsDocument,
      variables: {
        id: "test-id",
      },
    },
    result: {
      data: {
        creditFacility: mockCreditFacility({
          id: "test-id",
          transactions: [
            mockCreditFacilityIncrementalPayment({
              recordedAt: "2024-01-01T00:00:00Z",
              txId: "tx-1",
            }),
            mockCreditFacilityCollateralUpdated({
              recordedAt: "2024-01-02T00:00:00Z",
              action: CollateralAction.Add,
              txId: "tx-2",
            }),
            mockCreditFacilityDisbursalExecuted({
              recordedAt: "2024-01-03T00:00:00Z",
              txId: "tx-3",
            }),
            mockCreditFacilityInterestAccrued({
              recordedAt: "2024-01-04T00:00:00Z",
              txId: "tx-4",
              days: 30,
            }),
          ],
        }),
      },
    },
  },
]
export const Default: Story = {
  args: {
    params: mockParams,
  },
  decorators: [
    (Story) => (
      <MockedProvider mocks={layoutMocks} addTypename={false}>
        <CreditFacilityLayout params={mockParams}>
          <MockedProvider mocks={transactionsMocks} addTypename={false}>
            <Story />
          </MockedProvider>
        </CreditFacilityLayout>
      </MockedProvider>
    ),
  ],
}
