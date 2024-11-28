import type { Meta, StoryObj } from "@storybook/react"
import { MockedProvider } from "@apollo/client/testing"

import { AppSidebar } from "./"

import { SidebarProvider } from "@/ui/sidebar"
import {
  Role,
  AvatarDocument,
  GetRealtimePriceUpdatesDocument,
} from "@/lib/graphql/generated"

const defaultMocks = [
  {
    request: { query: AvatarDocument },
    result: {
      data: {
        me: {
          user: {
            userId: "usr_123",
            email: "demo@example.com",
            roles: [Role.Admin],
          },
        },
      },
    },
  },
  {
    request: { query: GetRealtimePriceUpdatesDocument },
    result: {
      data: {
        realtimePrice: {
          usdCentsPerBtc: 4500000,
        },
      },
    },
  },
]

const meta = {
  title: "Components/AppSidebar",
  component: AppSidebar,
  parameters: {
    layout: "fullscreen",
    backgrounds: {
      default: "light",
    },
  },
  decorators: [
    (Story) => (
      <MockedProvider mocks={defaultMocks}>
        <SidebarProvider>
          <Story />
        </SidebarProvider>
      </MockedProvider>
    ),
  ],
} satisfies Meta<typeof AppSidebar>

export default meta
type Story = StoryObj<typeof AppSidebar>

export const Default: Story = {}
