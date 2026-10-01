#!/usr/bin/env bash
# =============================================================================
# Starts the production build the way musiker15.service does, and checks that
# it answers.
#
# On 01.10.2026 a dependency update took the site down for six minutes. A new
# version of @swc/core unpacked a native binary into a cache below the home
# directory, and the service runs with ProtectHome=read-only. `next start` died
# while loading next.config.ts. CI was green: the runner starts the same build
# with a writable home, so nothing there could see it.
#
# This script closes that gap. It reads the hardening options from the unit
# file in deploy/systemd/ and starts `next start` under exactly those, through
# systemd-run. The options are read rather than copied, so tightening the unit
# tightens this check with it.
#
# Linux with systemd and passwordless sudo only, which is what the CI runner
# is. Needs a finished `next build` in the working directory.
# =============================================================================
set -euo pipefail

UNIT_FILE="deploy/systemd/musiker15.service"
APP="$(pwd)"
PORT="${PORT:-3299}"
UNIT="m15-start-check-$$"
NODE_DIR="$(dirname "$(command -v node)")"

# Every sandboxing option of the unit, one -p each. ReadWritePaths is the one
# that cannot be taken over as written: the unit names /opt/musiker15, here the
# application lives in the checkout.
properties=()
while IFS= read -r line; do
  properties+=(-p "$line")
done < <(grep -E '^(NoNewPrivileges|PrivateTmp|Protect[A-Za-z]+|Restrict[A-Za-z]+|LockPersonality|MemoryDenyWriteExecute|SystemCallArchitectures|SystemCallFilter)=' "$UNIT_FILE")

if [ "${#properties[@]}" -eq 0 ]; then
  echo "No hardening options found in $UNIT_FILE, this check would test nothing." >&2
  exit 1
fi

echo "Starting under: ${properties[*]}"

cleanup() {
  sudo systemctl stop "$UNIT" >/dev/null 2>&1 || true
}
trap cleanup EXIT

sudo systemd-run --unit="$UNIT" --collect --quiet \
  -p User="$(id -un)" \
  -p WorkingDirectory="$APP" \
  -p ReadWritePaths="$APP" \
  -p Environment="NODE_ENV=production" \
  -p Environment="PORT=$PORT" \
  -p Environment="HOSTNAME=127.0.0.1" \
  -p Environment="NEXT_TELEMETRY_DISABLED=1" \
  -p Environment="PATH=$NODE_DIR:/usr/bin:/bin" \
  "${properties[@]}" \
  /usr/bin/env node_modules/.bin/next start -p "$PORT" -H 127.0.0.1

for attempt in $(seq 1 20); do
  if curl -fsS -o /dev/null "http://127.0.0.1:$PORT/de"; then
    echo "The build starts under the options of the service and answers on /de."
    exit 0
  fi
  # The process is gone: no point in waiting for the remaining attempts.
  if ! sudo systemctl is-active --quiet "$UNIT"; then
    break
  fi
  sleep 1
done

echo "The build does not start under the options of the service. Its log:" >&2
sudo journalctl -u "$UNIT" --no-pager -n 60 >&2 || true
exit 1
