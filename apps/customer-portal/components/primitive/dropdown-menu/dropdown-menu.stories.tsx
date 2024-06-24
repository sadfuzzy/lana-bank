import React from "react"
import { Meta, StoryFn } from "@storybook/react"

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/primitive/dropdown-menu"
import { Button } from "@/components/primitive/button"

export default {
  title: "Components/DropdownMenu",
  component: DropdownMenuContent,
  argTypes: {
    children: {
      control: "text",
      description: "Content of the dropdown menu",
    },
  },
} as Meta<typeof DropdownMenuContent>

const Template: StoryFn<typeof DropdownMenuContent> = (args) => (
  <DropdownMenu>
    <DropdownMenuTrigger>
      <Button>Open Dropdown</Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent {...args}>
      <DropdownMenuLabel>Options</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem>Item 1</DropdownMenuItem>
      <DropdownMenuItem>Item 2</DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuGroup>
        <DropdownMenuItem>Group Item 1</DropdownMenuItem>
        <DropdownMenuItem>Group Item 2</DropdownMenuItem>
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
      <DropdownMenuSub>
        <DropdownMenuSubTrigger>Sub Menu</DropdownMenuSubTrigger>
        <DropdownMenuSubContent>
          <DropdownMenuItem>Sub Item 1</DropdownMenuItem>
          <DropdownMenuItem>Sub Item 2</DropdownMenuItem>
        </DropdownMenuSubContent>
      </DropdownMenuSub>
    </DropdownMenuContent>
  </DropdownMenu>
)

export const Default = Template.bind({})
Default.args = {
  children: "This is the dropdown content.",
}
