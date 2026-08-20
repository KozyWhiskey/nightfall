# CI triage (Cursor Automation)

**Trigger:** GitHub Actions — workflow run completed, failed, workflow `check` on KozyWhiskey/nightfall  
**Repo:** nightfall  
**Tools:** Comment on pull request (and push to the PR branch if the run is on a PR)

Paste into **Agent Instructions**:

```
You triage a failed GitHub Actions check on Nightfall. You are a Cursor Cloud agent. Do not SSH to hermes.

## Read
Open the failed check log for the check workflow (pnpm check: typecheck, oxlint, check:boundaries, vitest, build).

## Decide
1. Failure is caused by the PR's own changes (or the commit on main that triggered the run): make the smallest fix that restores pnpm check. Do not weaken or delete tests. Do not remove check:boundaries. Do not disable CI. Do not change GitHub workflow just to go green.
2. Failure is flaky infrastructure (setup-node, network, cache): comment the excerpt, say it is not a product bug, and stop. Do not "fix" it by skipping checks.
3. Failure needs a design decision (accepted combat contract vs code): comment with the log excerpt and the owning spec path, then stop.

If this run is on a pull request, push the fix to that branch and comment what you changed. If it is on main and the fix is obvious and local to the failing files, open a small PR. Otherwise comment only.

Never treat browser or LAN Nightfall as the correctness check. Vitest is the gate.
```
