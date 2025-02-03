# tap-sumsubapi

`tap-sumsubapi` is a Singer tap for the Sumsub Api.

Built with the [Meltano Tap SDK](https://sdk.meltano.com) for Singer Taps.

## Installation

```
poetry install
```

## Configuration

### Accepted Config Options

<!--
poetry run tap-sumsubapi --about --format=markdown
-->

| Setting | Required | Default | Description |
|:--------|:--------:|:-------:|:------------|
| host | True     | None    |             |
| port | False    |    5432 |             |
| database | True     | None    |             |
| user | True     | None    |             |
| password | True     | None    |             |
| sslmode | False    | prefer  |             |
| sumsub_secret_key | True     | None    |             |
| sumsub_app_token | True     | None    |             |

### Configure using environment variables

This Singer tap will automatically import any environment variables within the working directory's
`.env` if the `--config=ENV` is provided, such that config values will be considered if a matching
environment variable is set either in the terminal context or in the `.env` file.

## Usage

You can easily run `tap-sumsubapi` by itself or in a pipeline using [Meltano](https://meltano.com/).

### Executing the Tap Directly

```bash
tap-sumsubapi --version
tap-sumsubapi --help
tap-sumsubapi --config CONFIG --discover > ./catalog.json
```

### Testing with [Meltano](https://www.meltano.com)

_**Note:** This tap will work in any Singer environment and does not require Meltano.
Examples here are for convenience and to streamline end-to-end orchestration scenarios._

Next, install Meltano (if you haven't already) and any needed plugins:

```bash
# Install meltano
pipx install meltano
# Initialize meltano within this directory
cd tap-sumsubapi
meltano install
```

Now you can test and orchestrate using Meltano:

```bash
# Test invocation:
meltano invoke tap-sumsubapi --version

# OR run a test ELT pipeline:
meltano run tap-sumsubapi target-jsonl
```
