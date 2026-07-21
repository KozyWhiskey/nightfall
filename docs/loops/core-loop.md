# Core Loop

**Status:** Locked  
**Last updated:** 2026-07-17  
**Related:** [run-structure.md](run-structure.md), [failure-and-torches.md](failure-and-torches.md), [../systems/map-and-nodes.md](../systems/map-and-nodes.md), [../systems/haven-buildings.md](../systems/haven-buildings.md)

## Goal

**Vertical-slice scope override:** the current loop uses the fixed Vanguard + Aether Weaver pair, The Unlit Road, and one Band-1 boss. Broader 2–3 hero party selection, recruiting, multiple Gates, and extended cross-school reactions remain future direction.

Bind every session to a dual loop: **expedition** (tactical fun) and **Haven** (long-term identity and stakes).

## Dual loop

```text
Haven (build, recruit, pick Gate, embark)
    → Expedition legs: Approach → Delve → (optional chain later) → Return leg
        → Delve boss claims Waypoint (map grows; pillars unchanged)
        → Waypoint chest may safeguard limited spoils
        → Bank at Haven  —or—  Wipe (−1 town pillar; party lost)
            → Haven grows or dims (pillars, scars, buildings, world map)
```

**Vocabulary:** **Return leg** = third expedition phase (get home). **Bank / Haven return** = run outcome after the legs. **Town pillars** = Haven HP (separate from waypoints). Do not conflate with level bands (Frontier / Mid / Deep) — those are Gate destinations, not legs. See [run-structure.md](run-structure.md) and [../content/regions/README.md](../content/regions/README.md).

### Haven phase (meta)

1. Name / view Haven; see **pillar** state (town HP), waypoints, and buildings.
2. Manage roster (heal, train, recruit if available).
3. Spend expedition resources on buildings / upgrades; optionally spend Ember Shards to restore pillars.
4. Vertical slice: embark the fixed Vanguard + Aether Weaver pair through the one available Frontier Gate.

### Expedition phase (run)

1. Traverse **Approach → Delve → Return leg** (risk vs reward) for the chosen segment.
2. Fight using per-hero decks (attacks, abilities, spells; schools limit what you can learn).
3. Loot gear and scrolls; craft with sliding risk (cross-school reactions when you know both schools).
4. Resolve events (survivors, resources, rumors).
5. Clear the **Delve Segment Boss** to claim a **Waypoint** and expand the world (does not auto-restore a pillar).
6. Optionally spend an **Ember Shard** at act end to restore a town pillar immediately, or keep it (lost on wipe if not banked).
7. Finish the **Return leg** with spoils (chested goods move to Haven on successful return) — or die (**−1 pillar**; party lost to the Gloom). Soft abandon is not allowed.

## Session cadence

| Loop | Target feel |
|------|-------------|
| Single expedition | Medium+ investment; a build should have time to come online |
| Between expeditions | Meaningful Haven choices (which building next? mend pillars?) |
| Haven lifetime | Multiple expeditions; can end in permanent failure at 0 pillars |

## Fun priority inside the loop

When short on time or conflicting rewards: prefer combat puzzle quality and buildcraft spikes over meta busywork. Haven is a **sink and stake**, not a second full game to manage every minute.

## Acceptance criteria

- [ ] Player can explain Haven ↔ expedition in one sentence
- [ ] A successful run visibly changes Haven (resources and/or buildings and/or roster and/or waypoints)
- [ ] A failed run visibly changes Haven (pillar / scars), not only “run over” UI
