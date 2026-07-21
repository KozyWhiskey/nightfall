# Screens and Flows

**Status:** Supporting screen inventory
**Last updated:** 2026-07-19

**Build 1 authority:** [Interaction Contract](interaction-contract.md) owns visible information, legal commands, confirmation, and persistence behavior. This document is a navigation inventory only; older future rows must not widen Build 1 scope.

## Goal

**Scope note:** The screen list below includes both the solo vertical slice and future UX. Only rows explicitly marked **Future** are out of scope; do not treat them as implementation requirements.

Define the player-facing screen map implied by the bible — independent of the archived prototype UI.

## Primary flow

```text
Boot → Haven Hub → (Intro: settler Ember gift on first leave)
    → Embark (Gate + loadout) → Leg Map ⇄ Node Screens
    → Waypoint (chest + Ember rite option) → Return / Wipe → Haven Hub
```

## Screen inventory

| Screen | Purpose |
|--------|---------|
| **Haven Hub** | Name, **pillar HP** (ring of 10), Gloom meter, buildings, roster entry, embark |
| **World / Path Map** | Claimed waypoints, available Gates (fresh Haven: one path); can overlay Haven Hub |
| **Building Board** | Unlock/upgrade buildings; see opportunity cost |
| **Roster / Memorial** | Living heroes, recruit intake, Memorial plaque list; soft band-completion record |
| **Embark** | Vertical slice: fixed Vanguard + Aether Weaver pair; confirm Gate and committed Haven possessions |
| **First Embark** | Fixed Vanguard + Aether Weaver party; introduces committed Haven possessions and wipe risk. |
| **Leg Map** | Approach / Delve / Return path choice; risk/reward previews |
| **Waypoint** | After Delve boss — map claim; **chest** deposit; Ember→pillar rite; begin Return |
| **Combat** | Initiative timeline, hands, intents, AP/mana |
| **Event** | Choice UI (full screen) |
| **Rest** | Recovery choices |
| **Shop** | **Future:** spend run resources |
| **Craft** | Risk-tier craft confirm |
| **Loot / Reward** | Gear & scroll decisions; deck impact preview; instance roll variance readable |
| **Subclass Offer** | Pick subclass (permanent — no respec) |
| **Level Up** | Stat / growth choices |
| **Run Results** | Return spoils or wipe + **pillar snuff** / mourning |
| **Post-Return Haven Flow** | Homecoming, Return Ledger, Chronicle, permanent Leadership, and Haven decision board |
| **Legacy Scar** | After Haven death (0 pillars) — remnants for next town |
| **Friends / Havens** | **Future:** async list and read-only Haven peek |
| **Co-op Lobby** | **Future:** party up before embark |

## Implementation note

Greenfield client screens land in the `client` workspace per [../product/tech-decision.md](../product/tech-decision.md). Do not revive archived prototype UI.

## Acceptance criteria

- [ ] Every must-ship system has a screen or explicit overlay
- [ ] Pillar state visible from Haven Hub without digging
- [ ] Waypoint chest vs carried loot risk is readable
- [ ] Craft risk tier visible before confirm
- [ ] First successful Return presents multiple valid Haven needs but enough resources for only one meaningful decision
