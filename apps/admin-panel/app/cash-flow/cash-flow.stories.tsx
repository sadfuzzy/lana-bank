import type { Meta, StoryObj } from "@storybook/react"
import { MockedProvider } from "@apollo/client/testing"

import CashFlow from "./page"

import { CashFlowStatementDocument } from "@/lib/graphql/generated"

import { cashFlowMockData } from "@/.storybook/mocks"

const createMocks = () => [
  {
    request: {
      query: CashFlowStatementDocument,
    },
    variableMatcher: () => true,
    result: cashFlowMockData,
  },
]

const CashFlowStory = () => {
  const mocks = createMocks()

  return (
    <MockedProvider mocks={mocks} addTypename={false}>
      <CashFlow />
    </MockedProvider>
  )
}

const LoadingStory = () => {
  const mocks = [
    {
      request: {
        query: CashFlowStatementDocument,
      },
      variableMatcher: () => true,
      delay: Infinity,
    },
  ]

  return (
    <MockedProvider mocks={mocks} addTypename={false}>
      <CashFlow />
    </MockedProvider>
  )
}

const meta = {
  title: "Pages/CashFlow",
  component: CashFlowStory,
  parameters: {
    layout: "fullscreen",
    nextjs: {
      appDirectory: true,
    },
  },
} satisfies Meta<typeof CashFlow>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  parameters: {
    nextjs: {
      navigation: {
        pathname: "/cash-flow",
      },
    },
  },
}

export const Loading: Story = {
  render: LoadingStory,
  parameters: {
    nextjs: {
      navigation: {
        pathname: "/cash-flow",
      },
    },
  },
}
