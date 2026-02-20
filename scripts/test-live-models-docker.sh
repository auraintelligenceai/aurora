#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
IMAGE_NAME="${AURA_IMAGE:-aura_intelligence:local}"
CONFIG_DIR="${AURA_CONFIG_DIR:-$HOME/.aura}"
WORKSPACE_DIR="${AURA_WORKSPACE_DIR:-$HOME/aura}"
PROFILE_FILE="${AURA_PROFILE_FILE:-$HOME/.profile}"

PROFILE_MOUNT=()
if [[ -f "$PROFILE_FILE" ]]; then
  PROFILE_MOUNT=(-v "$PROFILE_FILE":/home/node/.profile:ro)
fi

echo "==> Build image: $IMAGE_NAME"
docker build -t "$IMAGE_NAME" -f "$ROOT_DIR/Dockerfile" "$ROOT_DIR"

echo "==> Run live model tests (profile keys)"
docker run --rm -t \
  --entrypoint bash \
  -e COREPACK_ENABLE_DOWNLOAD_PROMPT=0 \
  -e HOME=/home/node \
  -e NODE_OPTIONS=--disable-warning=ExperimentalWarning \
  -e AURA_LIVE_TEST=1 \
  -e AURA_LIVE_MODELS="${AURA_LIVE_MODELS:-all}" \
  -e AURA_LIVE_PROVIDERS="${AURA_LIVE_PROVIDERS:-}" \
  -e AURA_LIVE_MODEL_TIMEOUT_MS="${AURA_LIVE_MODEL_TIMEOUT_MS:-}" \
  -e AURA_LIVE_REQUIRE_PROFILE_KEYS="${AURA_LIVE_REQUIRE_PROFILE_KEYS:-}" \
  -v "$CONFIG_DIR":/home/node/.aura \
  -v "$WORKSPACE_DIR":/home/node/aura \
  "${PROFILE_MOUNT[@]}" \
  "$IMAGE_NAME" \
  -lc "set -euo pipefail; [ -f \"$HOME/.profile\" ] && source \"$HOME/.profile\" || true; cd /app && pnpm test:live"
