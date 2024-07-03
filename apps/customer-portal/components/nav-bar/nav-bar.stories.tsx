import React from "react"
import { Meta, StoryFn } from "@storybook/react"

import { NavBarAuthenticated, NavBarAuthenticatedProps } from "./nav-bar-authenticated"

export default {
  title: "Components/NavBarAuthenticated",
  component: NavBarAuthenticated,
  parameters: {
    layout: "fullscreen",
  },
} as Meta<NavBarAuthenticatedProps>

const Template: StoryFn<NavBarAuthenticatedProps> = (args) => (
  <NavBarAuthenticated {...args} />
)

export const LoggedIn = Template.bind({})
LoggedIn.args = {
  email: "user@example.com",
}
