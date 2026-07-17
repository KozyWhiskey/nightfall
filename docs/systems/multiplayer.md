# Multiplayer

**Status:** Draft  
**Last updated:** 2026-07-16  
**Related:** [party-and-roster.md](party-and-roster.md), [combat.md](combat.md), [../product/horizon.md](../product/horizon.md)

## Goal

Friends on a self-hosted server enjoy **async own-Havens** and optional **co-op PvE expeditions**. No PvP. Solo remains first-class.

## Hosting context (locked)

- Deployed on the owner’s **N100 headless** machine; players join on the **LAN** (not a public commercial service).
- Cheating is not a product concern; still follow **best practices** for correctness and simplicity.

### Authority model (locked)

**Authoritative host** — the N100 (or process on it) owns simulation truth: combat resolution, RNG streams, loot/Need-Greed, Gloom/torch updates. Clients send intents (“play card X on target Y”); host applies rules and broadcasts state.

Why even without cheaters: fewer desyncs, one RNG authority, simpler co-op debugging, matches future tech decision.

## Modes

### Async presence (light must-ship) — list + peek

- Each player account has their **own named Haven**.
- **List:** friends see Haven name, lit torches / ring progress, Gloom at a glance.
- **Peek:** open a **read-only summary** (buildings present/tiers, memorial count, maybe roster size) — no editing another player’s town.
- **Visit** (walk their hub), gifts, ghost parties = nice later.

### Co-op expedition (must-ship)

- 2–3 **heroes** share one run (party size unchanged).
- **1–3 human players** on the LAN; fewer humans than heroes is fine.
- **Hero ownership** is assigned in the lobby — a player may **control multiple heroes** (same mental model as solo). There is **no AI ally** for must-ship.
- On your owned hero’s initiative turn(s), you play that hand; shared map and encounter state.
- PvE only.

### Ally hand visibility (locked)

- **Allies can see each other’s hands** (full card faces) to support cooperative puzzles.
- Enemies never see player hands.

## Design constraints (MP-safe solo systems)

These rules apply even before netcode exists:

1. **No unreproducible randomness in gameplay** — all rolls use seeded streams that can be shared/authoritative.
2. **Per-hero ownership** — card play, equip, and craft targeting a hero require that hero’s controller (solo = one controller for all).
3. **Visible shared state** — intents, initiative, map, and torch-relevant outcomes must be identical for all clients.
4. **Deterministic resolution order** — ties, simultaneous effects, status ticks have a documented order.
5. **Map choices** — one authority (embark leader) unless an event is `per_player`.
6. **Loot (locked): Need / Greed draft** — on a contested drop, each player may call **Need** or **Greed** (or pass). Need outranks Greed; ties broken by seeded roll. Winner takes the item into their hero’s inventory; afterward, normal out-of-combat **trading** still applies.
7. **Gear trading** — out of combat only; trades require consent of both players who own the items involved.

## Co-op UX rules

- On an owned hero’s initiative turn, that owner plays; others can see the hand and advise.
- Disconnect: **pause** for host decision (reassign ownership or abort) — do **not** silently AI-pilot a hero for must-ship.
- Never brick torch/Gloom resolution without a clear host UI.

## Non-goals

- Competitive modes
- Drop-in raiding that ignores expedition structure
- Cross-Haven resource theft

## Acceptance criteria

- [ ] Solo expedition uses the same ruleset as co-op with a single owner
- [ ] Spec calls out every system that needs an “owner” field
- [ ] Friends list + peek is enough to feel co-located on the host

### Need / Greed details

| Call | Meaning |
|------|---------|
| Need | This drop meaningfully upgrades *my* hero’s build |
| Greed | I’ll take it for trade/craft/extract value |
| Pass | Skip this roll |

Solo: no draft — loot goes to party inventory / active picker as in single-player reward UI.

## Open questions

- None blocking for v1 co-op rules above. (Smarter disconnect reassign UX can deepen later.)
