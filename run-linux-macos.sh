#!/usr/bin/env sh
set -eu
if ! command -v node >/dev/null 2>&1; then
  echo "Node.js 20 ou supérieur est requis." >&2
  exit 1
fi
( sleep 1; if command -v xdg-open >/dev/null 2>&1; then xdg-open http://127.0.0.1:4173 >/dev/null 2>&1 || true; elif command -v open >/dev/null 2>&1; then open http://127.0.0.1:4173 || true; fi ) &
node scripts/server.mjs
