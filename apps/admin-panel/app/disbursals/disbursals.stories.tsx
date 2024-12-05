import type { Meta, StoryObj } from "@storybook/react"
import { MockedProvider } from "@apollo/client/testing"

import Disbursals from "./page"

import faker from "@/.storybook/faker"

import { DisbursalsDocument, DisbursalStatus } from "@/lib/graphql/generated"
import { mockCreditFacilityDisbursal, mockPageInfo } from "@/lib/graphql/generated/mocks"

const createRandomDisbursals = () => {
  const count = faker.number.int({ min: 5, max: 10 })
  return Array.from({ length: count }, () => ({
    node: mockCreditFacilityDisbursal({
      status: faker.helpers.arrayElement(Object.values(DisbursalStatus)),
    }),
  }))
}

const baseMocks = [
  {
    request: {
      query: DisbursalsDocument,
      variables: {
        first: 10,
      },
    },
    result: {
      data: {
        disbursals: {
          edges: createRandomDisbursals(),
          pageInfo: mockPageInfo(),
        },
      },
    },
  },
]

const meta = {
  title: "Pages/Disbursals",
  component: Disbursals,
  parameters: {
    layout: "fullscreen",
    nextjs: {
      appDirectory: true,
    },
  },
} satisfies Meta<typeof Disbursals>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  decorators: [
    (Story) => (
      <MockedProvider mocks={baseMocks} addTypename={false}>
        <Story />
      </MockedProvider>
    ),
  ],
  parameters: {
    nextjs: {
      navigation: {
        pathname: "/disbursals",
      },
    },
  },
}
