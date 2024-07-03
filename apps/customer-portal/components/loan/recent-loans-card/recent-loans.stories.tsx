import React from "react"
import { Meta, StoryFn } from "@storybook/react"

import { LoanCard } from "@/components/loan/recent-loans-card"

export default {
  title: "Components/LoanCard",
  component: LoanCard,
  parameters: {
    layout: "centered",
  },
} as Meta

const Template: StoryFn = () => <LoanCard />

export const Default = Template.bind({})
