next-watch:
	cargo watch -s 'cargo nextest run'

clean-deps:
	docker compose down -t 1

start-deps:
	docker compose up -d integration-deps

setup-db:
	cd core && sleep 2 && cargo sqlx migrate run

sqlx-prepare:
	cd core && cargo sqlx prepare

reset-deps: clean-deps start-deps setup-db

run-server:
	cargo run --bin lava-core -- --config ./bats/lava.yml

check-code: public-sdl admin-sdl
	git diff --exit-code core/src/server/public/schema.graphql
	git diff --exit-code core/src/server/admin/schema.graphql
	SQLX_OFFLINE=true cargo fmt --check --all
	SQLX_OFFLINE=true cargo check
	SQLX_OFFLINE=true cargo clippy --all-features
	SQLX_OFFLINE=true cargo audit

build:
	SQLX_OFFLINE=true cargo build --locked

e2e: clean-deps start-deps build
	bats -t bats

e2e-in-ci: bump-cala-docker-image e2e

public-sdl:
	SQLX_OFFLINE=true cargo run --bin write_public_sdl > core/src/server/public/schema.graphql

admin-sdl:
	SQLX_OFFLINE=true cargo run --bin write_admin_sdl > core/src/server/admin/schema.graphql
	cd apps/admin-panel && pnpm install && pnpm codegen

bump-cala-schema:
	curl -H "Authorization: token ${GITHUB_TOKEN}" https://raw.githubusercontent.com/GaloyMoney/cala-enterprise/main/schema.graphql > core/src/ledger/cala/graphql/schema.graphql

bump-cala-docker-image:
	docker compose pull cala

bump-cala: bump-cala-docker-image bump-cala-schema

test-in-ci: start-deps
	sleep 2
	cd core && cargo sqlx migrate run
	cargo nextest run --verbose --locked

build-x86_64-unknown-linux-musl-release:
	SQLX_OFFLINE=true cargo build --release --locked --bin lava-core --target x86_64-unknown-linux-musl

build-x86_64-apple-darwin-release:
	bin/osxcross-compile.sh

start-admin:
	cd apps/admin-panel && pnpm install --frozen-lockfile && pnpm dev

start-frontend:
	cd apps/lava-bank && pnpm install --frozen-lockfile && pnpm dev

check-code-apps: check-code-apps-admin-panel check-code-apps-frontend

check-code-apps-admin-panel:
	cd apps/admin-panel && pnpm install --frozen-lockfile && pnpm lint && pnpm build

check-code-apps-frontend:
	cd apps/lava-bank && pnpm install --frozen-lockfile && pnpm lint && pnpm build
