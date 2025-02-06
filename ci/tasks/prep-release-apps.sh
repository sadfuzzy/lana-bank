#!/usr/bin/env bash

set -eu

export version=$(cat ./version/version)

pushd admin-panel-src/apps/admin-panel

cat <<EOF >> .env
NEXT_PUBLIC_APP_VERSION=${version}
EOF

popd

pushd customer-portal-src/apps/customer-portal

cat <<EOF >> .env
NEXT_PUBLIC_APP_VERSION=${version}
EOF
