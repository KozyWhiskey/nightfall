# Screens and Flows

**Status:** Draft  
**Last updated:** 2026-07-17

## Goal

Define the player-facing screen map implied by the bible — independent of the archived prototype UI.

## Primary flow

```text
Boot → Haven Hub → (Intro: settler Ember gift on first leave)
    → Embark (Gate + loadout) → Leg Map ⇄ Node Screens
    → Waypoint (chest + Ember rite option) → Return / Wipe → Haven Hub
```

## Screen inventory (must-ship)

| Screen | Purpose |
|--------|---------|
| **Haven Hub** | Name, **pillar HP** (ring of 10), Gloom meter, buildings, roster entry, embark |
| **World / Path Map** | Claimed waypoints, available Gates (fresh Haven: one path); can overlay Haven Hub |
| **Building Board** | Unlock/upgrade buildings; see opportunity cost |
| **Roster / Memorial** | Living heroes, recruit intake, Memorial plaque list; soft band-completion record |
| **Embark** | Pick 2–3 heroes; **Gate** (level band); supplies; confirm |
| **Intro gift** | First leave: settler grants **2 Ember Shards** (teach dual use) |
| **Leg Map** | Approach / Delve / Return path choice; risk/reward previews |
| **Waypoint** | After Delve boss — map claim; **chest** deposit; Ember→pillar rite; begin Return |
| **Combat** | Initiative timeline, hands, intents, AP/mana |
| **Event** | Choice UI (full screen) |
| **Rest** | Recovery choices |
| **Shop** | Spend run resources |
| **Craft** | Risk-tier craft confirm |
| **Loot / Reward** | Gear & scroll decisions; deck impact preview; instance roll variance readable |
| **Subclass Offer** | Pick subclass (permanent — no respec) |
| **Level Up** | Stat / growth choices |
| **Run Results** | Return spoils or wipe + **pillar snuff** / mourning |
| **Legacy Scar** | After Haven death (0 pillars) — remnants for next town |
| **Friends / Havens** | Async list + read-only **peek** summary (pillars, Gloom, buildings, memorials) |
| **Co-op Lobby** | Party up before embark |

## Implementation note

Greenfield client screens land in the `client` workspace per [../product/tech-decision.md](../product/tech-decision.md). Do not revive archived prototype UI.

## Acceptance criteria

- [ ] Every must-ship system has a screen or explicit overlay
- [ ] Pillar state visible from Haven Hub without digging
- [ ] Waypoint chest vs carried loot risk is readable
- [ ] Craft risk tier visible before confirm
