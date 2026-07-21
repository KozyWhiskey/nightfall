# Decision Register

**Status:** Active authority index
**Last updated:** 2026-07-19

## Purpose and authority

This register is the shortest path to an approved Build 1 rule. It does not duplicate design details: each entry links to its owning specification.

When sources conflict, use this order:

1. A newer, explicitly user-approved decision recorded here.
2. [Current Product Scope](current-scope.md) for Build 1 inclusion and exclusion.
3. [Vertical-Slice Handoff](vertical-slice-handoff.md) for the playable-loop contract.
4. An accepted system specification, then an accepted content pack.
5. Draft, horizon, and historical documents for context only.

Every approved decision that changes a rule must update this register and its owning document in the same change. A draft must never silently override this register.

## Build 1 decisions

| ID | Decision | Canonical rule | Owner |
|---|---|---|---|
| `scope.party` | Playable party | Fixed Vanguard + Aether Weaver pair; three-hero play is future compatibility only. | [Current Scope](current-scope.md) |
| `combat.basics` | Baseline actions | Basic Attack and Basic Block are reliable 1-AP buttons outside the deck; no Mana/Stamina cost. | [Combat](../systems/combat.md) |
| `combat.resources` | Expedition resources | HP, Mana, and Stamina persist through a run. Each victorious combat restores 50% of maximum Mana and Stamina; explicit Rest, supplies, and events may restore more. | [Combat](../systems/combat.md) |
| `combat.deck` | Starting deck and hand | Each hero starts with four cards: two class cards and two equipped-item cards. Hand size is three; Basics are outside the deck. | [Cards and Decks](../systems/cards-and-decks.md) |
| `combat.scrolls` | Learned-scroll persistence | Learning consumes a compatible physical scroll. Every eligible learned scroll becomes a permanent personal deck card only when its hero survives successful Return. | [Post-Return Flow](../ux/post-return-flow.md) |
| `combat.loadout` | Gear-change moments | Equip, unequip, trade, and learn held scrolls only at Haven, post-combat reward, Rest, Safe Craft, or waypoint/post-boss reward. Never in combat, ordinary movement, or Event resolution. | [Embark and Loadout](../systems/embark-and-loadout.md) |
| `combat.equipment` | Equipment sheet | Nine slots: Main Hand, Offhand; Head, Body, Gloves, Legs, Feet; Relic I, Relic II. `Relic` is a slot category; rarity tops out at Legendary. | [Gear and Affixes](../systems/gear-and-affixes.md) |
| `combat.initiative` | Timeline | Individual initiative uses `(DEX x 2) + itemInitiative + seeded variance`; every normal enemy intent is visible before it resolves. | [Combat](../systems/combat.md) |
| `run.gloom` | Travel pressure | Each travelled edge adds 5 Run Gloom. Gloom bands are deterministic and visible. | [Gloom, Light, and Rest](../systems/gloom-and-stress.md) |
| `run.rest` | Rest | Rest has a base `-12` Run Gloom change, which only a disclosed expedition flag may modify; it then offers Tend Wounds, Resupply, or Keep Watch. | [Gloom, Light, and Rest](../systems/gloom-and-stress.md) |
| `run.opening` | First encounter | Roadside Trail is two Gloomfang Hounds; it is deliberately easy and teaches focus, Block, and initiative. | [Unlit Road](../content/expeditions/the-unlit-road.md) |
| `run.failure` | Wipe and protection | Full-party wipe loses party and unsealed expedition holdings, snuffs one pillar, and preserves waypoint-chest contents. | [Run Structure](../loops/run-structure.md) |
| `run.lifecycle` | Expedition state and boss persistence | Boss victory immediately claims its waypoint and grants its permanent discovery; physical boss rewards remain at risk until Return or chest protection. Run terminal states and transaction order follow the expedition state machine. | [Expedition State Machine](../systems/expedition-state-machine.md) |
| `haven.succession` | Final-pillar Haven failure | A fallen Haven creates a new Haven at the furthest claimed waypoint (or Cinder Refuge if none), with 3 lit / 7 snuffed pillars, Haven Gloom 7, and a small emergency cache. World knowledge persists; settlement materials, buildings, gear, and heroes do not. | [Failure, Pillars, and Haven Succession](../loops/failure-and-torches.md) |
| `haven.growth` | Survivor progression | Expedition stat choices are temporary. Each surviving boss-clear hero earns one pending Leadership Point; Wardyard assigns it permanently with no respec. | [First Haven Progression](../content/haven/first-haven-progression.md) |
| `architecture.truth` | Build 1 technical architecture | Local Node host, pure deterministic simulation, validated content, SQLite persistence, and snapshot-only UI form the approved Build 1 architecture. Future networking must use the same command path. | [Build 1 Architecture Decision](../architecture/build-1-architecture.md) |
| `architecture.determinism` | Randomness and saves | Named RNG streams, versioned snapshots, validated revisioned commands, and replay-safe state are mandatory. | [Combat Simulation Contract](../systems/combat-simulation-contract.md) |
| `content.contract` | Content authority | Immutable validated definitions, persistent instances, declarative effects, and save-safe content versioning are mandatory. | [Content Data Contract](../systems/content-data-contract.md) |
| `ux.interaction` | Player-facing command boundary | Every Build 1 view renders authoritative snapshots, exposes only revision-valid commands, and makes risk, permanence, and resolved state readable. | [Build 1 Interaction Contract](../ux/interaction-contract.md) |
| `balance.initial` | Initial tuning and completion targets | First-expedition rewards, events, crafting, temporary progression, and test ranges use the accepted tuning table; values change only through recorded playtest rationale. | [Vertical-Slice Tuning](../content/expeditions/vertical-slice-tuning.md) |
| `content.pack` | Loadable first content pack | Build 1 loads only the accepted finite registry: starter cards, scrolls, vessels including three armor pieces, affixes, encounters, events, recipes, boss, and route IDs. Umbra scrolls are held-only. | [Build 1 Content Registry](../content/vertical-slice-content-registry.md) |
| `build.acceptance` | Build 1 completion bar | Build 1 must satisfy the accepted deterministic scenarios, player journeys, offline terminal flows, and tuning gate before completion. | [Build 1 Acceptance Plan](build-1-acceptance-plan.md) |

## Decision lifecycle

- **Proposed:** under discussion; no implementation dependency.
- **Approved:** add here, update the owning spec, and retire any superseded wording.
- **Playtest-tunable:** a rule is approved, but its numeric value may change through recorded testing.
- **Future:** record only the extension seam in [Future Compatibility Ledger](future-compatibility-ledger.md), not a premature implementation.
