const tables = ["loans", "loan_events", "customer_events", "price_cents_btc", "sumsub_applicants", "credit_facility_events", "accounts", "account_sets", "account_set_members", "balances", "tx_templates", "transactions", "entries"]

envs.all.forEach((env) => {
  tables.forEach((table) => {
    declare({
      database: env.database,
      schema: env.importSchema,
      name: table,
      tags: ["lava"]
    })
  })
})
