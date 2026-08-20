#!/usr/bin/env bash
set -euo pipefail
url="${NIGHTFALL_HEALTH_URL:-http://127.0.0.1:3051/api/health}"
curl -fsS "$url"
echo
