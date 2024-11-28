import type { Meta, StoryObj } from "@storybook/react"
import { MockedProvider } from "@apollo/client/testing"

import TrialBalance from "./page"

import {
  GetOnBalanceSheetTrialBalanceDocument,
  GetOffBalanceSheetTrialBalanceDocument,
} from "@/lib/graphql/generated"

import {
  onBalanceSheetTrialBalanceMockData,
  offBalanceSheetTrialBalanceMockData,
} from "@/.storybook/mocks"

const createMocks = () => [
  {
    request: {
      query: GetOnBalanceSheetTrialBalanceDocument,
    },
    variableMatcher: () => true,
    result: onBalanceSheetTrialBalanceMockData,
  },
  {
    request: {
      query: GetOffBalanceSheetTrialBalanceDocument,
    },
    variableMatcher: () => true,
    result: offBalanceSheetTrialBalanceMockData,
  },
]

const TrialBalanceStory = () => {
  const mocks = createMocks()

  return (
    <MockedProvider mocks={mocks} addTypename={false}>
      <TrialBalance />
    </MockedProvider>
  )
}

const meta = {
  title: "Pages/TrialBalance",
  component: TrialBalanceStory,
  parameters: {
    layout: "fullscreen",
    nextjs: {
      appDirectory: true,
    },
  },
} satisfies Meta<typeof TrialBalance>

export default meta

type Story = StoryObj<typeof meta>
export const Default: Story = {}
