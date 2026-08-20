# Daily spec scout (Cursor Automation)

**Trigger:** cron daily  
**Repo:** KozyWhiskey/nightfall, branch `main`  
**Tools:** PR creation, memories on  
**Model:** strongest available for contract reasoning

## Instructions

Read `docs/product/decision-register.md` and accepted combat/UX contracts. Diff them against `packages/sim` and `packages/client/src/combat`. Ignore Draft-only wording unless it matches the register.

For each new gap:

- `bug` or test-only `enhancement`: open a draft PR adding `docs/specs/approved/<slug>.md` plus a failing fixture when cheap, label `auto-bug`.
- `new_capability`: open a docs-only PR adding `docs/specs/proposed/<slug>.md`. Do not implement.

Skip anything already in `docs/specs/`. Do nothing if there is no new gap. Use memories so you do not re-propose shipped items.
