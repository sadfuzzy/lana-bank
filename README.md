# Lana bank

**to run (unit) tests:**

```bash
make reset-deps next-watch
```

**to run e2e tests:**

```bash
make e2e
```

**to run the server:**

```
make run-server
```

### To fetch latest `cala-enterprise` build

1. Auth with `$ gcloud auth login`

1. Configure docker `$ gcloud auth configure-docker`

1. Run `$ make bump-cala-docker-image` to test that image can be fetched

### To update cala-enterprise schema

1. Create a github "fine-grained token" with **Content** read-only permission

1. Add token to `.env` file as `export GITHUB_TOKEN=<token-here>`

1. Run `$ direnv allow` to source token

1. Run `$ make bump-cala-schema` to update schema

# access the frontends:

the access through the frontends needs to be proxied to oathkeeper to receive the correct Header

admin panel: http://localhost:4455/admin-panel

use email admin@galoy.io
connect to http://0.0.0.0:8025/

app: http://localhost:4455/

- if you see a cookie error, delete the cookie and reload the page (for now)

# To setup BQ dev

needs re-running when adding new BQ tables:

```
git checkout pre-merged-commit
# this is important to have the previous state before pulling
make reset-deps
git pull
make init-bq
```

If you are doing work that requires adding a new big query table you need to add it to `./tf/cala-setup/bq.tf`
