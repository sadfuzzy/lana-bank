import { StoryObj } from "@storybook/react"

import DataTable from "./"

type User = {
  id: number
  name: string
  email: string
  role: string
  status: "active" | "inactive"
  lastLogin: string
}

const meta = {
  title: "Components/DataTable",
  component: DataTable,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
}

export default meta
type Story = StoryObj<typeof DataTable>

const users: User[] = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    role: "Admin",
    status: "active",
    lastLogin: "2024-03-20",
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane@example.com",
    role: "User",
    status: "inactive",
    lastLogin: "2024-03-15",
  },
]

export const Basic: Story = {
  args: {
    data: users,
    columns: [
      { key: "name", header: "Name" },
      { key: "email", header: "Email" },
      { key: "role", header: "Role" },
    ],
  },
}

export const CustomRendering = {
  args: {
    data: users,
    columns: [
      { key: "name", header: "Name" },
      {
        key: "status",
        header: "Status",
        render: (status: User["status"]) => (
          <span
            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
            ${status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
          >
            {status}
          </span>
        ),
      },
      {
        key: "lastLogin",
        header: "Last Login",
        render: (date: string) => new Date(date).toLocaleDateString(),
      },
    ],
    rowClassName: (item: User) => (item.status === "inactive" ? "opacity-60" : ""),
  },
}

export const Loading: Story = {
  args: {
    data: [],
    loading: true,
    columns: [
      { key: "name", header: "Name" },
      { key: "email", header: "Email" },
      { key: "role", header: "Role" },
    ],
  },
}

export const Empty: Story = {
  args: {
    data: [],
    columns: [
      { key: "name", header: "Name" },
      { key: "email", header: "Email" },
      { key: "role", header: "Role" },
    ],
    emptyMessage: "No users found",
  },
}

export const Interactive: Story = {
  args: {
    data: users,
    columns: [
      { key: "name", header: "Name" },
      { key: "email", header: "Email" },
      { key: "role", header: "Role" },
    ],
    onRowClick: (item) => alert(`Clicked row with ID: ${item.id}`),
  },
}

export const FullFeatured = {
  args: {
    data: users,
    columns: [
      {
        key: "name",
        header: "Name",
        width: "200px",
      },
      {
        key: "email",
        header: "Email",
        width: "250px",
      },
      {
        key: "status",
        header: "Status",
        align: "center",
        render: (status: User["status"]) => (
          <span
            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
            ${status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
          >
            {status}
          </span>
        ),
      },
      {
        key: "lastLogin",
        header: "Last Login",
        align: "right",
        render: (date: string) => new Date(date).toLocaleDateString(),
      },
    ],
    onRowClick: (item: User) => alert(`Clicked row with ID: ${item.id}`),
  },
}
