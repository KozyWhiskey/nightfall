# Regions

**Status:** Draft  
**Last updated:** 2026-07-17  
**Related:** [../../systems/map-and-nodes.md](../../systems/map-and-nodes.md), [../../loops/run-structure.md](../../loops/run-structure.md), [../../loops/core-loop.md](../../loops/core-loop.md)

## Design law (locked)

Two separate axes (do not conflate):

1. **Expedition legs** — Approach → Delve → Return (structure of a run). See run-structure / map-and-nodes / core-loop.
2. **Level bands** — which difficulty / ecology template a Gate opens. Templates below are **band ecologies**, not legs and not “story Act 1/2/3.”

Bands are **tier templates** (ecology, enemy roles, difficulty). **Display names are drawn from seeded pools** so expeditions feel like new stretches of a procedural world — not the same three maps every time.

As waypoints open, new **segments** generate using these band templates (and later additional bands). The frontier always has somewhere harder to grow into.

| Level band | Template brief | Name pool (all valid) | Typical Gates |
|------------|----------------|------------------------|---------------|
| 1 — Frontier | [band-1.md](band-1.md) | Whisperwood, Murkwood, Blackcopse, Hushweald | Fresh Haven starter gate |
| 2 — Mid | [band-2.md](band-2.md) | Shattered Marches, Ashroads, Broken Causeway, Bone March | After early waypoints / rumor unlocks |
| 3 — Deep | [band-3.md](band-3.md) | Umbrafall, Smotherdeep, Nightcleft, Gloamfall | Later waypoints / high Gates |

### Selection rules

- On embark, the chosen **Gate** selects a **level band**; generation picks a name from that band’s pool via seeded RNG (`map` stream).
- Prefer **not repeating** a name already used on this Haven’s recent path when alternatives remain (domain-tunable).
- Same template mechanics; different name + light flavor line so it feels like exploring somewhere new.
- Claiming a waypoint **attaches** new segment stubs (same or adjacent bands) so the map expands.
- Pools are **domain data** — add/remove names without changing systems.

### Legacy redirects

| Old path | Goes to |
|----------|---------|
| [act-1.md](act-1.md) | [band-1.md](band-1.md) |
| [act-2.md](act-2.md) | [band-2.md](band-2.md) |
| [act-3.md](act-3.md) | [band-3.md](band-3.md) |

## Legs vs bands (example)

A Mid-band Delve might roll “Ashroads.” Approach and Return leg for that expedition use Mid-band encounter tables with leg-specific node weights (Return lighter). The boss is always on Delve — claiming the Ashroads waypoint — not on the road home.
