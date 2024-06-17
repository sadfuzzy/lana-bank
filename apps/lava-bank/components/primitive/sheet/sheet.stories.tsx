import React from "react"
import { Meta, StoryFn } from "@storybook/react"

import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
} from "@/components/primitive/sheet"
import { Button } from "@/components/primitive/button"

export default {
  title: "Components/Sheet",
  component: SheetContent,
  argTypes: {
    children: {
      control: "text",
      description: "Content of the sheet",
    },
    side: {
      control: { type: "select", options: ["top", "bottom", "left", "right"] },
      description: "Side from which the sheet appears",
    },
  },
} as Meta<typeof SheetContent>

const Template: StoryFn<typeof SheetContent> = (args) => (
  <Sheet>
    <SheetTrigger asChild>
      <Button>Open Sheet</Button>
    </SheetTrigger>
    <SheetContent {...args}>
      <SheetHeader>
        <SheetTitle>Sheet Title</SheetTitle>
        <SheetDescription>This is the sheet description.</SheetDescription>
      </SheetHeader>
      <div className="mt-4">{args.children || "This is the sheet content."}</div>
      <SheetFooter>
        <Button variant="primary">Confirm</Button>
      </SheetFooter>
    </SheetContent>
  </Sheet>
)

export const Default = Template.bind({})
Default.args = {
  side: "right",
  children: "This is the sheet content.",
}

export const FromTop = Template.bind({})
FromTop.args = {
  side: "top",
  children: "This sheet comes from the top.",
}

export const FromBottom = Template.bind({})
FromBottom.args = {
  side: "bottom",
  children: "This sheet comes from the bottom.",
}

export const FromLeft = Template.bind({})
FromLeft.args = {
  side: "left",
  children: "This sheet comes from the left.",
}

export const FromRight = Template.bind({})
FromRight.args = {
  side: "right",
  children: "This sheet comes from the right.",
}
