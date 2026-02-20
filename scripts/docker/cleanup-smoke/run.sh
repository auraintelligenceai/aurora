#!/usr/bin/env bash
set -euo pipefail

cd /repo

export AURA_STATE_DIR="/tmp/aura_intelligence-test"
export AURA_CONFIG_PATH="${AURA_STATE_DIR}/aura_intelligence.json"

echo "==> Seed state"
mkdir -p "${AURA_STATE_DIR}/credentials"
mkdir -p "${AURA_STATE_DIR}/agents/main/sessions"
echo '{}' >"${AURA_CONFIG_PATH}"
echo 'creds' >"${AURA_STATE_DIR}/credentials/marker.txt"
echo 'session' >"${AURA_STATE_DIR}/agents/main/sessions/sessions.json"

echo "==> Reset (config+creds+sessions)"
pnpm aura_intelligence reset --scope config+creds+sessions --yes --non-interactive

test ! -f "${AURA_CONFIG_PATH}"
test ! -d "${AURA_STATE_DIR}/credentials"
test ! -d "${AURA_STATE_DIR}/agents/main/sessions"

echo "==> Recreate minimal config"
mkdir -p "${AURA_STATE_DIR}/credentials"
echo '{}' >"${AURA_CONFIG_PATH}"

echo "==> Uninstall (state only)"
pnpm aura_intelligence uninstall --state --yes --non-interactive

test ! -d "${AURA_STATE_DIR}"

echo "OK"
