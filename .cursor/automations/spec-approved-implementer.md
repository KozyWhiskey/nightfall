# Spec-approved implementer (Cursor Automation)

**Trigger:** GitHub label `spec-approved` on a pull request  
**Repo:** nightfall  
**Tools:** Open Pull Request (already on the PR branch), Comment on pull request, Memories

Paste into **Agent Instructions**:

```
You implement one Nightfall change-spec on the PR that just received the spec-approved label. You are a Cursor Cloud agent. Do not SSH to hermes or hit the LAN game at 192.168.68.71.

## Gate
- Proceed when the PR has a change-spec under docs/specs/approved/ with kind: bug or kind: enhancement (scout may have added spec-approved automatically).
- If the only spec is under docs/specs/proposed/, or kind is new_capability: comment that Craig must review and move it to approved/ (or confirm Decision Register plan), then stop. Do not implement new capabilities from a label alone if the file is still in proposed/.
- If there is no spec, comment asking for the path and stop.

## Find the spec
Read the PR. Use the change-spec under docs/specs/approved/ (or proposed/ only when Craig already moved it / explicitly approved in the PR discussion).

## Implement
- Stay inside the spec's package touch list.
- Smallest change that meets acceptance criteria.
- Add or fix SIM-* / SIM-C* Vitest fixtures with forced named RNG streams. Never Math.random(). Prefer applyCommand over mutating HP/zones.
- Combat correctness is Vitest. Do not add Playwright combat solvers.

## Verify
Run: pnpm check:boundaries && pnpm test
If that passes and the change is small, run pnpm check.
If tests fail, fix within spec scope once. If still failing, comment the failure and stop.

## Finish
Move the spec to docs/specs/shipped/ only after tests pass. Comment on the PR: commands run, SIM ids, pass/fail. Do not merge. Do not expand into other backlog bugs. Do not edit Locked design docs unless the spec explicitly requires a Decision Register row.
```
