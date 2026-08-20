#!/usr/bin/env bash
set -euo pipefail
input=$(cat)
path=$(printf '%s' "$input" | jq -r '.file_path // .path // empty')
if [[ "$path" != *packages/sim/* && "$path" != *packages/client/* ]]; then
  echo '{}'
  exit 0
fi
jq -n --arg path "$path" '{
  additional_context: ("Edited " + $path + ". If this is sim or client code, run `pnpm check:boundaries` before finishing. Sim must stay free of React/DOM/network/Math.random; client must not import sim/host/persistence.")
}'
