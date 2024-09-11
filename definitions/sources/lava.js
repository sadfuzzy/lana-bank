const tables = ["loans", "loan_events", "customer_events"]

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
