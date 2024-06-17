import React from "react"
import { Meta, StoryFn } from "@storybook/react"

import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from "@/components/primitive/table"

export default {
  title: "Components/Table",
  component: Table,
  argTypes: {
    children: {
      control: "text",
      description: "Content of the table",
    },
  },
} as Meta<typeof Table>

const Template: StoryFn<typeof Table> = (args) => (
  <Table {...args}>
    <TableCaption>Sample Table</TableCaption>
    <TableHeader>
      <TableRow>
        <TableHead>Header 1</TableHead>
        <TableHead>Header 2</TableHead>
        <TableHead>Header 3</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow>
        <TableCell>Data 1</TableCell>
        <TableCell>Data 2</TableCell>
        <TableCell>Data 3</TableCell>
      </TableRow>
      <TableRow>
        <TableCell>Data 4</TableCell>
        <TableCell>Data 5</TableCell>
        <TableCell>Data 6</TableCell>
      </TableRow>
    </TableBody>
    <TableFooter>
      <TableRow>
        <TableCell>Footer 1</TableCell>
        <TableCell>Footer 2</TableCell>
        <TableCell>Footer 3</TableCell>
      </TableRow>
    </TableFooter>
  </Table>
)

export const Default = Template.bind({})
Default.args = {
  children: (
    <>
      <TableCaption>Sample Table</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Header 1</TableHead>
          <TableHead>Header 2</TableHead>
          <TableHead>Header 3</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>Data 1</TableCell>
          <TableCell>Data 2</TableCell>
          <TableCell>Data 3</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Data 4</TableCell>
          <TableCell>Data 5</TableCell>
          <TableCell>Data 6</TableCell>
        </TableRow>
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell>Footer 1</TableCell>
          <TableCell>Footer 2</TableCell>
          <TableCell>Footer 3</TableCell>
        </TableRow>
      </TableFooter>
    </>
  ),
}
