# Haven Buildings

**Status:** Draft — vertical-slice availability locked; first-tier details in design review
**Last updated:** 2026-07-18
**Related:** [Current Product Scope](../product/current-scope.md), [Vertical-Slice Handoff](../product/vertical-slice-handoff.md), [Economy](economy.md), [Progression](progression.md)

## Goal

The named Haven is a resource sink with identity. A successful early expedition should present several valuable needs but fund only one meaningful answer. Building order is a buildcraft choice, not a hidden progression gate.

## Vertical-slice rules

- **Pillarhouse** is built at founding.
- **Cinder Forge**, **The Quiet House**, and **The Wardyard** are visible and constructible from a fresh Haven. The player begins without enough resources to build any of them.
- The first successful Return should make roughly one of those three constructions affordable, not all of them.
- The first boss grants the **Ember Vault blueprint**; the second boss grants **The Wayfarer blueprint**. Blueprint discovery is in scope, while their full functional tiers are deferred.
- Buildings are not all free at once. The player chooses which need to address and postpones the others.
- When a Haven permanently fails, buildings are lost; a later new Haven may retain only the limited Legacy-Scar inheritance defined in [Failure and Torches](../loops/failure-and-torches.md).

## Building web

| ID | Building | Vertical-slice status | Primary role |
|---|---|---|---|
| `pillarhouse` | **Pillarhouse** | Built at founding | Pillar ring, Haven Gloom, memorial, Ember-Shard light rites, embark context |
| `cinder_forge` | **Cinder Forge** | Constructible from start | Gear crafting, starter equipment direction, Safe Imprint |
| `quiet_house` | **The Quiet House** | Constructible from start | Treat temporary downed-hero injuries and support survivors |
| `wardyard` | **The Wardyard** | Constructible from start | Assign earned permanent level points; future drills/subclass rites |
| `ember_vault` | **Ember Vault** | Blueprint from first boss | Future: returned scroll catalogue, spellcraft, curse care |
| `wayfarer` | **The Wayfarer** | Blueprint from second boss | Future: rumors, settlement leads, recruit/class offers |

## Deferred buildings

| Building | Later role |
|---|---|
| **The Stockhouse** | Resource capacity and embark supplies |
| **The Cartographer's Table** | Route intelligence, Gate/waypoint context, map discovery support |
| **The Names Wall** | Dedicated memorial and fallen-Haven history presentation |

## Construction philosophy

First-tier costs, material income, operations, and leadership rules: [First Haven Progression](../content/haven/first-haven-progression.md).

- Construction costs use Timber, Stone, and Wick. Wick is intentionally scarcer because it represents light, care, and magical civic infrastructure.
- Exact first-tier costs and actions are being designed in the Haven progression package; they must preserve the one-meaningful-decision early economy.
- Cinder Forge owns gear shaping. Ember Vault owns spell knowledge and advanced scrollcraft. Quiet House owns injury care. Wardyard owns permanent hero development.
- Future upgrades may expand each building, but the vertical slice should prove one clear benefit per active core building before tier depth is added.

## Future identity examples

- Forge-first Haven: gear shaping and equipment-led builds.
- Quiet-House-first Haven: preserves an injured, valued survivor.
- Wardyard-first Haven: turns survival into permanent stat direction.
- Ember-Vault-first Haven: expands spellcraft after the first blueprint is made functional.
- Wayfarer-first Haven: converts settlement discoveries into wider-world opportunities.

## Acceptance criteria

- [ ] The Haven UI shows all three available early construction choices and what each postpones.
- [ ] A player can describe why their first building choice changes the next expedition.
- [ ] A successful Return cannot fund every visible major need.
- [ ] Blueprint discovery is concrete even before the later building is affordable.
