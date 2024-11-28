import type { Meta, StoryObj } from "@storybook/react"
import { MockedProvider } from "@apollo/client/testing"

import ChartOfAccounts from "./page"

import {
  GetOnBalanceSheetChartOfAccountsDocument,
  GetOffBalanceSheetChartOfAccountsDocument,
} from "@/lib/graphql/generated"

import {
  regularChartOfAccountsMockData,
  offBalanceSheetChartOfAccountsMockData,
} from "@/.storybook/mocks"

const createMocks = () => [
  {
    request: {
      query: GetOnBalanceSheetChartOfAccountsDocument,
    },
    result: regularChartOfAccountsMockData,
  },
  {
    request: {
      query: GetOffBalanceSheetChartOfAccountsDocument,
    },
    result: offBalanceSheetChartOfAccountsMockData,
  },
]

const ChartOfAccountsStory = () => {
  const mocks = createMocks()

  return (
    <MockedProvider mocks={mocks} addTypename={false}>
      <ChartOfAccounts />
    </MockedProvider>
  )
}

const meta = {
  title: "Pages/ChartOfAccounts",
  component: ChartOfAccountsStory,
  parameters: {
    layout: "fullscreen",
    nextjs: {
      appDirectory: true,
    },
  },
} satisfies Meta<typeof ChartOfAccounts>

export default meta

type Story = StoryObj<typeof meta>
export const Default: Story = {}
