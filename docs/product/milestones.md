# Milestones

**Status:** Draft  
**Last updated:** 2026-07-17  
**Depends on:** design bible review → [tech-decision.md](tech-decision.md)

## Phase 0 — Design bible (this folder)

- [x] Scaffold `docs/`
- [x] Lock north star + horizon
- [x] Draft spine systems
- [x] Resolve open questions that block vertical slice v2
- [ ] Owner review pass (“this is the game”)

## Phase 1 — Tech decision

- [x] Evaluate keep / adapt / rewrite of prototype stack against bible
- [x] Document in [tech-decision.md](tech-decision.md) (Locked — greenfield TS monorepo)
- [x] Archive prototype `src/` → `docs/_archive/prototype-src/`
- [x] Archive local Supabase + wipe prototype `node_modules` / env
- [ ] Scaffold workspaces (`sim` / `server` / `client` / `content`) per tech decision
- **Do not start feature implementation that assumes old single-hero model**

## Phase 2 — Vertical slice v2 (single-player)

Prove the new fantasy in one playable loop:

**Implementation boundary:** Phase 2 explicitly excludes co-op, accounts, and async Haven lists. Its state and ownership model must remain safe for the later authoritative-host phase, but the playable deliverable is solo and saveable.

- Haven (name, pillars at 10/10, built Pillarhouse; Cinder Forge, Quiet House, and Wardyard constructible; roster of 3 core classes)
- First fully playable class kits: **Vanguard + Aether Weaver**; Shadowblade remains a core-class follow-on
- Embark recommended Vanguard + Aether Weaver party of 2; free party choice follows the first return; intro settler gift of 2 Ember Shards
- One Frontier Gate: Approach → Delve (boss / waypoint + chest + ruined-settlement trace) → short Return leg
- Combat / event / craft nodes on the path
- Per-hero decks (attacks + abilities + spells)
- Initiative + AP
- One Safe and one Risky craft; starter deck cores are fixed, with one or two randomized starter cards/items per hero
- Wipe snuffs a **town pillar**; banking / Return deposits resources; chested goods survive wipe at waypoint

## Phase 3 — Content fill

- 3 classes × 2 subclasses
- Band 1–2 content density (Frontier / Mid Gates)
- Event set (≥8)
- Haven building web to must-ship count

## Phase 4 — Co-op + async light

- Co-op lobby + owned heroes
- Deterministic shared resolution
- Friends Haven list on host

## Phase 5 — Polish & host pride

- Atmosphere pass (art/audio as needed)
- Stability for friends nights
- Nice-later backlog triage

## Exit criteria for “proud to host”

Matches [horizon.md](horizon.md) must-ship list.
