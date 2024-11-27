import type { Meta, StoryObj } from "@storybook/react"
import { MockedProvider } from "@apollo/client/testing"

import UsersPage from "./page"

import faker from "@/.storybook/faker"

import { UsersDocument } from "@/lib/graphql/generated"
import { mockUser } from "@/lib/graphql/generated/mocks"

const createRandomUsers = () => {
  const count = faker.number.int({ min: 4, max: 8 })
  return Array.from({ length: count }, () => mockUser())
}

const baseMocks = [
  {
    request: {
      query: UsersDocument,
    },
    result: {
      data: {
        users: createRandomUsers(),
      },
    },
  },
]

const meta = {
  title: "Pages/Users",
  component: UsersPage,
  parameters: {
    layout: "fullscreen",
    nextjs: {
      appDirectory: true,
    },
  },
} satisfies Meta<typeof UsersPage>

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
