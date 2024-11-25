import { useState } from "react"

import type { Meta, StoryObj } from "@storybook/react"

import PaginatedTable, { PaginatedData } from "./"

type Person = {
  id: string
  name: string
  email: string
  status: "ACTIVE" | "PENDING" | "INACTIVE"
  role: "ADMIN" | "USER" | "MANAGER"
  joinDate: string
}

const SAMPLE_DATA: Person[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john.doe@example.com",
    status: "ACTIVE",
    role: "ADMIN",
    joinDate: "2024-01-15T10:00:00Z",
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane.smith@example.com",
    status: "PENDING",
    role: "USER",
    joinDate: "2024-02-20T09:30:00Z",
  },
  {
    id: "3",
    name: "Bob Johnson",
    email: "bob.johnson@example.com",
    status: "INACTIVE",
    role: "MANAGER",
    joinDate: "2024-03-10T14:20:00Z",
  },
  {
    id: "4",
    name: "Alice Brown",
    email: "alice.brown@example.com",
    status: "ACTIVE",
    role: "USER",
    joinDate: "2024-01-05T11:45:00Z",
  },
  {
    id: "5",
    name: "Charlie Wilson",
    email: "charlie.wilson@example.com",
    status: "ACTIVE",
    role: "MANAGER",
    joinDate: "2024-02-28T16:15:00Z",
  },
  {
    id: "6",
    name: "Eva Davis",
    email: "eva.davis@example.com",
    status: "PENDING",
    role: "USER",
    joinDate: "2024-03-15T13:30:00Z",
  },
  {
    id: "7",
    name: "Frank Miller",
    email: "frank.miller@example.com",
    status: "ACTIVE",
    role: "ADMIN",
    joinDate: "2024-01-25T10:20:00Z",
  },
  {
    id: "8",
    name: "Grace Taylor",
    email: "grace.taylor@example.com",
    status: "INACTIVE",
    role: "USER",
    joinDate: "2024-02-10T09:00:00Z",
  },
  {
    id: "9",
    name: "Henry Anderson",
    email: "henry.anderson@example.com",
    status: "ACTIVE",
    role: "MANAGER",
    joinDate: "2024-03-05T15:45:00Z",
  },
  {
    id: "10",
    name: "Ivy Clark",
    email: "ivy.clark@example.com",
    status: "PENDING",
    role: "USER",
    joinDate: "2024-01-30T12:10:00Z",
  },
  {
    id: "11",
    name: "Jack Lewis",
    email: "jack.lewis@example.com",
    status: "ACTIVE",
    role: "ADMIN",
    joinDate: "2024-02-15T14:30:00Z",
  },
  {
    id: "12",
    name: "Kelly Martin",
    email: "kelly.martin@example.com",
    status: "INACTIVE",
    role: "USER",
    joinDate: "2024-03-20T11:20:00Z",
  },
  {
    id: "13",
    name: "Leo Parker",
    email: "leo.parker@example.com",
    status: "ACTIVE",
    role: "MANAGER",
    joinDate: "2024-01-10T16:40:00Z",
  },
  {
    id: "14",
    name: "Mia Roberts",
    email: "mia.roberts@example.com",
    status: "PENDING",
    role: "USER",
    joinDate: "2024-02-25T10:15:00Z",
  },
  {
    id: "15",
    name: "Noah Thompson",
    email: "noah.thompson@example.com",
    status: "ACTIVE",
    role: "ADMIN",
    joinDate: "2024-03-01T13:50:00Z",
  },
]

const meta: Meta<typeof PaginatedTable<Person>> = {
  title: "Components/PaginatedTable",
  component: PaginatedTable,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-[900px] p-4">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof PaginatedTable<Person>>

const createPaginatedData = (data: Person[]): PaginatedData<Person> => ({
  edges: data.map((node) => ({ node, cursor: node.id })),
  pageInfo: {
    hasNextPage: false,
    hasPreviousPage: false,
    startCursor: data[0]?.id || "",
    endCursor: data[data.length - 1]?.id || "",
  },
})

export const Basic: Story = {
  args: {
    columns: [
      { key: "name", label: "Name" },
      { key: "email", label: "Email" },
      { key: "role", label: "Role" },
    ],
    data: createPaginatedData(SAMPLE_DATA),
    pageSize: 10,
    loading: false,
  },
}

export const CustomRendering: Story = {
  args: {
    columns: [
      { key: "name", label: "Name" },
      {
        key: "status",
        label: "Status",
        render: (status: Person["status"]) => (
          <span
            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
            ${
              status === "ACTIVE"
                ? "bg-green-100 text-green-800"
                : status === "PENDING"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-red-100 text-red-800"
            }`}
          >
            {status.toLowerCase()}
          </span>
        ),
      },
      {
        key: "joinDate",
        label: "Join Date",
        render: (date: string) => new Date(date).toLocaleDateString(),
      },
    ],

    data: createPaginatedData(SAMPLE_DATA),
    pageSize: 10,
    loading: false,
    showHeader: false,
  },
}

export const WithSortingAndFiltering: Story = {
  render: (args) => {
    const [data, setData] = useState(() => createPaginatedData(SAMPLE_DATA))

    const handleSort = (column: keyof Person, direction: "ASC" | "DESC") => {
      const sortedData = [...data.edges].sort((a, b) => {
        const valueA = a.node[column]
        const valueB = b.node[column]
        const compareResult = String(valueA).localeCompare(String(valueB))
        return direction === "ASC" ? compareResult : -compareResult
      })

      setData({
        edges: sortedData,
        pageInfo: data.pageInfo,
      })
    }

    const handleFilter = (
      column: keyof Person,
      value: Person[keyof Person] | undefined,
    ) => {
      const filteredData = SAMPLE_DATA.filter(
        (item) => value === undefined || item[column] === value,
      )

      setData(createPaginatedData(filteredData))
    }

    return (
      <PaginatedTable<Person>
        {...args}
        data={data}
        onSort={handleSort}
        onFilter={handleFilter}
        columns={[
          {
            key: "name",
            label: "Name",
            sortable: true,
          },
          {
            key: "status",
            label: "Status",
            filterValues: ["ACTIVE", "PENDING", "INACTIVE"],
            render: (status: Person["status"]) => (
              <span
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                ${
                  status === "ACTIVE"
                    ? "bg-green-100 text-green-800"
                    : status === "PENDING"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                }`}
              >
                {status.toLowerCase()}
              </span>
            ),
          },
          {
            key: "role",
            label: "Role",
            filterValues: ["ADMIN", "USER", "MANAGER"],
          },
        ]}
      />
    )
  },
  args: {
    pageSize: 10,
    loading: false,
  },
}

export const Loading: Story = {
  args: {
    columns: [
      { key: "name", label: "Name" },
      { key: "email", label: "Email" },
      { key: "role", label: "Role" },
    ],
    data: undefined,
    loading: true,
    pageSize: 10,
  },
}

export const Empty: Story = {
  args: {
    data: createPaginatedData([]),
  },
}
