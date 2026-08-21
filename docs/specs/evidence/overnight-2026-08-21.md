# Overnight autonomy — loot gameplay AAA

**Branch:** `overnight/loot-gameplay-aaa`  
**Started:** 2026-08-21 (~02:54 UTC)  
**Mission:** Diablo-grade loot feel + core loop tightness within Build 1 architecture.

## Morning briefing (living — append each cycle)

### Status

In progress. Scout complete; cycle 1 specs approved and implementation starting.

### Shipped this night

_(none yet — update as specs move to `shipped/`)_

### Specs in flight

1. `docs/specs/approved/procedural-affix-rolls.md` — real registry affix allocation
2. `docs/specs/approved/reward-desire-path.md` — reward compare / deck inject / carrier / leave gate

### Scout ranking (cycle order)

1. Reward compare + deck inject (UX bug vs interaction-contract)
2. Procedural affix rolls (sim bug vs content registry) — **starting first** as loot identity foundation
3. Wire text-only affix modifiers into combat
4. Readable effect/curse grammar
5. Carrier showcase (folded into reward-desire-path)
6. Rarity hierarchy beyond color
7. Wipe-risk strip on reward
8. Leave-confirm rarity gate (folded into reward-desire-path)

### How to playtest in the morning

1. `git checkout overnight/loot-gameplay-aaa && pnpm install && pnpm test`
2. `pnpm check:boundaries` (and ideally `pnpm check`)
3. `pnpm dev` → UI `http://127.0.0.1:3050` / host `http://127.0.0.1:3051/api/health`
4. Clear Roadside Trail; inspect reward offers for varied affix names and compare/deck lines

### Risks

- Existing fixtures may assume stub affix sets; stabilize with forced loot streams
- Wiring all registry modifiers in one night may be incomplete — prefer honest labels for wired mods first

### Next up

Implement procedural rolls → test → commit → reward desire path → modifier wiring → rarity/curse polish.

---

## Cycle log

### Cycle 0 — scout (done)

- Spec-scout + explore: biggest gaps are reward desire path, stubbed affix rolls, text-only modifiers.
- Branch created from latest `main`.
