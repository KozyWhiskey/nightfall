# Build Readiness

**Status:** Ready for architecture selection; do not scaffold until the stack and implementation plan are approved.  
**Last updated:** 2026-07-19

**Authority:** [Decision Register](decision-register.md) and [Current Product Scope](current-scope.md) supersede historical wording in this document.

## Decision summary

Nightfall is a dark-fantasy, party-based expedition roguelite. The core promise is **explore a shattered world, take visible risks for unique builds, and return enough people, knowledge, and salvage to keep a fragile Haven alive**.

The first implementation proves a polished **solo** loop. It is deliberately designed so an authoritative host and co-op can be added later, but it does not implement networking, accounts, or async Havens.

## Locked vertical-slice boundaries

| Include | Exclude / defer |
|---------|-----------------|
| Saveable solo Haven and one Band-1 expedition | Co-op, accounts, async Haven list/peek |
| Vanguard and Aether Weaver playable kits | Shadowblade kit and all future classes |
| Two-hero recommended first party | Full party-selection flexibility before first Return |
| Combat, Event, Rest, Craft, Boss, Waypoint, Return | Shop, Elite, greed-chain, extra segments |
| Safe and Risky craft with disclosed odds | Dire craft |
| Pillarhouse, Cinder Forge, Quiet House, Wardyard | Ember Vault and Wayfarer functionality beyond their blueprint discovery |
| 3–4 authored events, Band-1 enemies, one boss | Full Band-1 content density, Bands 2–3 |

## Core laws

1. A normal early expedition lasts **25–45 minutes**: Approach → Delve → Boss/Waypoint → Return.
2. A party wipe means every expedition hero is lost and **one** Haven pillar is snuffed. Ten pillars are Haven HP, not a prescribed ten-wipe campaign.
3. A real-life interruption saves at the current node or combat state. An in-world abandonment is a wipe-class loss.
4. Combat has individual initiative, no ordinary miss chance, no positional grid, and guaranteed Basic Attack/Block buttons outside the deck.
5. Cards, gear, and scrolls create immediate-versus-later tradeoffs. Gear and ordinary materials carried by a wiped party are lost unless a rule protects them.
6. Bosses claim waypoints but do not heal pillars. The first two boss discoveries award the Ember Vault and Wayfarer blueprints.
7. Major ruined-settlement discoveries can later unlock classes, schools, blueprints, or item/affix families.

## Required design references

- [North Star](../vision/north-star.md)
- [Combat](../systems/combat.md)
- [Cards and Decks](../systems/cards-and-decks.md)
- [Run Structure](../loops/run-structure.md)
- [Map and Nodes](../systems/map-and-nodes.md)
- [Haven Buildings](../systems/haven-buildings.md)
- [Vertical Slice Handoff](vertical-slice-handoff.md)

## Intentional post-slice decisions

These are not permission for an implementation agent to invent systems during the slice:

- Full card lists, enemy data, affix tables, and exact balance values beyond the first content pack
- Class/subclass permutations and broad school-discovery content
- Shop, Elite, Dire-craft, longer greed chains, Bands 2–3
- Building upgrades and backlog buildings
- Co-op and mixed-Haven expeditions

## Readiness gate

The design package is ready for architecture selection: the starter cards, Band-1 enemies, first boss, four events, first craft recipes, initial balance tables, executable content registry, and acceptance plan are approved. The implementation agent must not expand scope to solve unspecified later-game design.
