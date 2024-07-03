import { StoryFn, Meta } from "@storybook/react"

import { BalanceCard, Balance } from "./index"

export default {
  title: "Components/BalanceCard",
  component: BalanceCard,
} as Meta

const Template: StoryFn<{ balance: Balance[] }> = (args) => <BalanceCard {...args} />

export const Default = Template.bind({})
Default.args = {
  balance: [
    { currency: "USD", amount: "2500" },
    { currency: "BTC", amount: "1.5" },
  ],
}
