#!/usr/bin/env bash
set -euo pipefail

PORT="${1:-4173}"
HOST="127.0.0.1"
URL="http://${HOST}:${PORT}"

npm run dev -- --host "$HOST" --port "$PORT" > /tmp/fundwars-e2e-dev.log 2>&1 &
DEV_PID=$!

cleanup() {
  kill "$DEV_PID" >/dev/null 2>&1 || true
}
trap cleanup EXIT

# Wait for app to boot
for _ in {1..60}; do
  if curl -fsS "$URL" >/tmp/fundwars-e2e-home.html 2>/dev/null; then
    break
  fi
  sleep 1
done

curl -fsS "$URL" >/tmp/fundwars-e2e-home.html

if ! grep -qi "Fund Wars" /tmp/fundwars-e2e-home.html; then
  echo "E2E smoke failed: title content missing" >&2
  exit 1
fi

if ! grep -q 'id="root"' /tmp/fundwars-e2e-home.html; then
  echo "E2E smoke failed: root mount element missing" >&2
  exit 1
fi

echo "E2E smoke passed at $URL"
