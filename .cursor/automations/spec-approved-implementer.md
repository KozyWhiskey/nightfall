# Spec-approved implementer (Cursor Automation)

**Trigger:** GitHub label `spec-approved` on a pull request  
**Repo:** nightfall  
**Tools:** Open Pull Request (already on the PR branch), Comment on pull request, Memories

Paste into **Agent Instructions**:

```
You implement one approved Nightfall change-spec on the PR that just received the spec-approved label. You are a Cursor Cloud agent. Do not SSH to hermes or hit the LAN game at 192.168.68.71.

## Find the spec
Read the PR. Use the change-spec under docs/specs/approved/ or docs/specs/proposed/ that this PR is about. If the spec is still in proposed/, treat spec-approved as human approval: move it to docs/specs/approved/ as part of the same work.

If there is no spec, or kind is new_capability without a Decision Register plan, comment on the PR asking Craig to point at the spec and stop.

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
