import React from "react"
import { Meta, StoryFn } from "@storybook/react"

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/primitive/dialog"
import { Button } from "@/components/primitive/button"

export default {
  title: "Components/Dialog",
  component: DialogContent,
  argTypes: {
    children: {
      control: "text",
      description: "Content of the dialog",
    },
  },
} as Meta<typeof DialogContent>

const Template: StoryFn<typeof DialogContent> = (args) => (
  <Dialog>
    <DialogTrigger asChild>
      <Button>Open Dialog</Button>
    </DialogTrigger>
    <DialogContent {...args}>
      <DialogHeader>
        <DialogTitle>Dialog Title</DialogTitle>
        <DialogDescription>This is the dialog description.</DialogDescription>
      </DialogHeader>
      <div className="mt-4">{args.children || "This is the dialog content."}</div>
      <DialogFooter>
        <Button variant="primary">Confirm</Button>
        <Button variant="secondary">Cancel</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
)

export const Default = Template.bind({})
Default.args = {
  children: "This is the dialog content.",
}
