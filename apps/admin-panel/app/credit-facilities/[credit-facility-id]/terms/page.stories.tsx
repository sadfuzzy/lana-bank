import type { Meta, StoryObj } from "@storybook/react"
import { MockedProvider } from "@apollo/client/testing"

import CreditFacilityLayout from "../layout"

import CreditFacilityTermsPage from "./page"

import {
  GetCreditFacilityBasicDetailsDocument,
  GetCreditFacilityTermsDocument,
} from "@/lib/graphql/generated"
import { mockCreditFacility } from "@/lib/graphql/generated/mocks"

const meta = {
  title: "Pages/CreditFacilities/CreditFacility/Terms",
  component: CreditFacilityTermsPage,
  parameters: {
    layout: "fullscreen",
    nextjs: {
      appDirectory: true,
    },
  },
} satisfies Meta<typeof CreditFacilityTermsPage>

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

const termsMocks = [
  {
    request: {
      query: GetCreditFacilityTermsDocument,
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
          <MockedProvider mocks={termsMocks} addTypename={false}>
            <Story />
          </MockedProvider>
        </CreditFacilityLayout>
      </MockedProvider>
    ),
  ],
}
