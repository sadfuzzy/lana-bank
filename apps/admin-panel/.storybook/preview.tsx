import type { Preview } from "@storybook/react"
import React from 'react'
import "../app/globals.css"

const preview: Preview = {
  parameters: {
    nextjs: {
      appDirectory: true,
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="max-w-7xl m-auto p-4">
        <Story />
      </div>
    ),
  ],
}

export default preview