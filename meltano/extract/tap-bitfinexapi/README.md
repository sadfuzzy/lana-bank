# tap-bitfinexapi

`tap-bitfinexapi` is a Singer tap for the Bitfinex Api.

Built with the [Meltano Tap SDK](https://sdk.meltano.com) for Singer Taps.

## Installation

```
poetry install
```

## Usage

You can easily run `tap-bitfinexapi` by itself or in a pipeline using [Meltano](https://meltano.com/).

### Executing the Tap Directly

```bash
tap-bitfinexapi --version
tap-bitfinexapi --help
tap-bitfinexapi --config CONFIG --discover > ./catalog.json
```

### Testing with [Meltano](https://www.meltano.com)

_**Note:** This tap will work in any Singer environment and does not require Meltano.
Examples here are for convenience and to streamline end-to-end orchestration scenarios._

Next, install Meltano (if you haven't already) and any needed plugins:

```bash
# Install meltano
pipx install meltano
# Initialize meltano within this directory
cd tap-bitfinexapi
meltano install
```

Now you can test and orchestrate using Meltano:

```bash
# Test invocation:
meltano invoke tap-bitfinexapi --version

# OR run a test ELT pipeline:
meltano run tap-bitfinexapi target-jsonl
```
