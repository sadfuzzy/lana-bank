import type { Meta, StoryObj } from "@storybook/react"
import { ApolloError } from "@apollo/client"
import { MockedProvider } from "@apollo/client/testing"

import Customer from "./page"

import { AccountStatus, GetCustomerDocument } from "@/lib/graphql/generated"

const baseMocks = [
  {
    request: {
      query: GetCustomerDocument,
      variables: {
        id: "4178b451-c9cb-4841-b248-5cc20e7774a6",
      },
    },
    result: {
      data: {
        customer: {
          id: "Customer:4178b451-c9cb-4841-b248-5cc20e7774a6",
          customerId: "4178b451-c9cb-4841-b248-5cc20e7774a6",
          email: "test@lana.com",
          telegramId: "test",
          status: AccountStatus.Inactive,
          level: "NOT_KYCED",
          applicantId: null,
          subjectCanRecordDeposit: true,
          subjectCanInitiateWithdrawal: true,
          subjectCanCreateCreditFacility: true,
          createdAt: "2024-11-25T06:23:56.549713Z",
          balance: {
            checking: {
              settled: 0,
              pending: 0,
            },
          },
          creditFacilities: [
            {
              id: "CreditFacility:313789f5-72f7-40bf-8eba-ae5c6b57b588",
              creditFacilityId: "313789f5-72f7-40bf-8eba-ae5c6b57b588",
              collateralizationState: "NO_COLLATERAL",
              status: "PENDING_COLLATERALIZATION",
              createdAt: "2024-11-25T06:25:30.866119Z",
              balance: {
                collateral: {
                  btcBalance: 0,
                },
                outstanding: {
                  usdBalance: 0,
                },
              },
            },
          ],
          deposits: [],
          withdrawals: [],
          transactions: [],
          documents: [],
        },
      },
    },
  },
]

const meta = {
  title: "Pages/Customer",
  component: Customer,
  parameters: {
    layout: "fullscreen",
    nextjs: {
      appDirectory: true,
    },
  },
  decorators: [
    (Story) => (
      <div className="max-w-7xl m-auto p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Customer>

export default meta
type Story = StoryObj<typeof meta>

const mockParams = { "customer-id": "4178b451-c9cb-4841-b248-5cc20e7774a6" }

export const Default: Story = {
  args: {
    params: mockParams,
  },
  decorators: [
    (Story) => (
      <MockedProvider mocks={baseMocks} addTypename={false}>
        <Story />
      </MockedProvider>
    ),
  ],
}

export const Error: Story = {
  args: {
    params: mockParams,
  },
  decorators: [
    (Story) => (
      <MockedProvider
        mocks={[
          {
            request: {
              query: GetCustomerDocument,
              variables: {
                id: "4178b451-c9cb-4841-b248-5cc20e7774a6",
              },
            },
            error: new ApolloError({ errorMessage: "An error occurred" }),
          },
        ]}
        addTypename={false}
      >
        <Story />
      </MockedProvider>
    ),
  ],
}

export const Empty: Story = {
  args: {
    params: mockParams,
  },
  decorators: [
    (Story) => (
      <MockedProvider
        mocks={[
          {
            request: {
              query: GetCustomerDocument,
              variables: {
                id: "4178b451-c9cb-4841-b248-5cc20e7774a6",
              },
            },
            result: {
              data: {
                customer: null,
              },
            },
          },
        ]}
        addTypename={false}
      >
        <Story />
      </MockedProvider>
    ),
  ],
}
