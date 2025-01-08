const dev = {
  name: "lana-dev",
  database: "lana-dev-440721",
  importSchema: dataform.projectConfig.vars.devUser + "_dataset",
}

const staging = {
  name: "galoy-staging",
  database: "galoy-staging",
  importSchema: "galoy_staging_dataset",
}

const prod = {
  name: "volcano-prod",
  database: "volcano-prod",
  importSchema: "volcano_prod_dataset",
}

const paramsByName = {
  [dev.name]: dev,
  [staging.name]: staging,
  [prod.name]: prod,
}

module.exports = {
  all: [dev, staging, prod],
  current: dataform.projectConfig.vars.executionEnv,
  currentDatabase: paramsByName[dataform.projectConfig.vars.executionEnv].database,
  currentImportSchema: paramsByName[dataform.projectConfig.vars.executionEnv].importSchema
}
