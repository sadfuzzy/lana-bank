import type { Meta, StoryObj } from "@storybook/react"
import { MockedProvider } from "@apollo/client/testing"

import CreditFacilityOverviewPage from "./page"
import CreditFacilityLayout from "./layout"

import {
  GetCreditFacilityBasicDetailsDocument,
  GetCreditFacilityOverviewDocument,
} from "@/lib/graphql/generated"
import { mockCreditFacility } from "@/lib/graphql/generated/mocks"

const meta = {
  title: "Pages/CreditFacilities/CreditFacility/Overview",
  component: CreditFacilityOverviewPage,
  parameters: {
    layout: "fullscreen",
    nextjs: {
      appDirectory: true,
    },
  },
} satisfies Meta<typeof CreditFacilityOverviewPage>

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

const overviewMocks = [
  {
    request: {
      query: GetCreditFacilityOverviewDocument,
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

export const Default: Story = {
  args: {
    params: mockParams,
  },
  decorators: [
    (Story) => (
      <MockedProvider mocks={layoutMocks} addTypename={false}>
        <CreditFacilityLayout params={mockParams}>
          <MockedProvider mocks={overviewMocks} addTypename={false}>
            <Story />
          </MockedProvider>
        </CreditFacilityLayout>
      </MockedProvider>
    ),
  ],
}
