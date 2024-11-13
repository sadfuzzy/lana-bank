import { defineConfig } from "cypress"

export default defineConfig({
  e2e: {
    baseUrl:
      process.env.BACKEND_ENV === "development"
        ? "http://localhost:4455/admin-panel"
        : "https://admin.staging.lava.galoy.io",
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    video: true,
    env: {
      MAGIC_LINK: process.env.MAGIC_LINK,
    },
  },
})
