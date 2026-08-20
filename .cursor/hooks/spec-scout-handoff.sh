#!/usr/bin/env bash
set -euo pipefail
input=$(cat)
output=$(printf '%s' "$input" | jq -r '.status // .result // empty')
text=$(printf '%s' "$input" | jq -r '.summary // .message // .output // empty' | tr '\n' ' ')
kind=$(printf '%s' "$text $output" | grep -oE 'kind[[:space:]]*[:=][[:space:]]*(bug|enhancement|new_capability)' | tail -n1 | awk -F'[=:]' '{print $NF}' | tr -d ' ')
if [[ "$kind" == "bug" || "$kind" == "enhancement" ]]; then
  jq -n --arg kind "$kind" '{
    followup_message: ("Spec scout classified this as " + $kind + ". Invoke the implementer subagent with the written change-spec path, then the combat-tester. Do not wait for human approval.")
  }'
  exit 0
fi
if [[ "$kind" == "new_capability" ]]; then
  echo '{
    "followup_message": "Spec scout classified this as a new_capability. Leave it in docs/specs/proposed/ and stop. Do not implement until the file is moved to docs/specs/approved/ or the tracking PR is labeled spec-approved."
  }'
  exit 0
fi
echo '{}'
