import type { Meta, StoryObj } from "@storybook/react"
import { MockedProvider } from "@apollo/client/testing"

import TermPage from "./page"

import faker from "@/.storybook/faker"

import { TermsTemplatesDocument } from "@/lib/graphql/generated"
import { mockTermsTemplate } from "@/lib/graphql/generated/mocks"

const createRandomTermsTemplates = () => {
  const count = faker.number.int({ min: 3, max: 10 })
  return Array.from({ length: count }, () => mockTermsTemplate())
}

const baseMocks = [
  {
    request: {
      query: TermsTemplatesDocument,
    },
    result: {
      data: {
        termsTemplates: createRandomTermsTemplates(),
      },
    },
  },
]

const meta = {
  title: "Pages/TermsTemplates",
  component: TermPage,
  parameters: {
    layout: "fullscreen",
    nextjs: {
      appDirectory: true,
    },
  },
} satisfies Meta<typeof TermPage>

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
}
