# Nightfall Design Bible

In-repo source of truth for **what the game should be**. Implementation and tech-stack choices follow this bible — not the other way around.

**Audience:** you, future-you, and coding agents.  
**Current build:** polished, saveable **solo vertical slice**. Read [product/current-scope.md](product/current-scope.md) before any system or implementation work. Co-op and async Havens are future design only.

## How to use

1. Read [`vision/north-star.md`](vision/north-star.md) first.
2. Read [`product/current-scope.md`](product/current-scope.md), then [`product/horizon.md`](product/horizon.md) for future direction.
3. When designing or implementing a feature, open the matching system spec under `systems/` or `loops/`.
4. Park unresolved decisions in [`product/open-questions.md`](product/open-questions.md).
5. New system docs should follow [`templates/system-spec.md`](templates/system-spec.md).

**Status legend:** Draft (editable) · Locked (change only with explicit revisit) · Stub · Deferred · Archive

## Index

### Vision
| Doc | Status |
|-----|--------|
| [north-star.md](vision/north-star.md) | Locked |
| [player-fantasy.md](vision/player-fantasy.md) | Locked |
| [tone-and-world.md](vision/tone-and-world.md) | Draft |
| [canon-and-history.md](vision/canon-and-history.md) | Locked |

### Loops
| Doc | Status |
|-----|--------|
| [core-loop.md](loops/core-loop.md) | Locked |
| [run-structure.md](loops/run-structure.md) | Draft |
| [failure-and-torches.md](loops/failure-and-torches.md) | Accepted Build 1 failure contract |

### Systems
| Doc | Status |
|-----|--------|
| [party-and-roster.md](systems/party-and-roster.md) | Draft |
| [combat.md](systems/combat.md) | Draft |
| [combat-simulation-contract.md](systems/combat-simulation-contract.md) | Accepted Build 1 simulation contract |
| [content-data-contract.md](systems/content-data-contract.md) | Accepted Build 1 shared content contract (Pass 3 complete) |
| [cards-and-decks.md](systems/cards-and-decks.md) | Draft |
| [gear-and-affixes.md](systems/gear-and-affixes.md) | Draft |
| [embark-and-loadout.md](systems/embark-and-loadout.md) | Accepted vertical-slice system |
| [expedition-state-machine.md](systems/expedition-state-machine.md) | Accepted Build 1 run contract |
| [spellcraft.md](systems/spellcraft.md) | Draft |
| [map-and-nodes.md](systems/map-and-nodes.md) | Draft |
| [events.md](systems/events.md) | Draft |
| [haven-buildings.md](systems/haven-buildings.md) | Draft |
| [economy.md](systems/economy.md) | Draft |
| [progression.md](systems/progression.md) | Draft |
| [gloom-and-stress.md](systems/gloom-and-stress.md) | Accepted vertical-slice system |
| [multiplayer.md](systems/multiplayer.md) | Draft |
| [balance-reference.md](systems/balance-reference.md) | Initial tuning framework |
| [spell-and-ability-framework.md](systems/spell-and-ability-framework.md) | Accepted framework |

### Content
| Doc | Status |
|-----|--------|
| [classes/](content/classes/) | Draft (3 starter briefs) |
| [crafting/](content/crafting/) | Draft (vertical-slice package) |
| [items/](content/items/) | Draft (procedural forge) |
| [regions/](content/regions/) | Draft (band-1…3 + name pools; legs ≠ bands) |
| [content-direction.md](content/content-direction.md) | Locked creative direction |
| [vertical-slice-content-registry.md](content/vertical-slice-content-registry.md) | Accepted loadable Build 1 content pack |
| [enemies/](content/enemies/) | Draft |
| [bosses/](content/bosses/) | Stub |
| [events/](content/events/) | Stub examples |
| [expeditions/](content/expeditions/) | Accepted Band-1 map, reward, and tuning package |
| [spells/](content/spells/) | Accepted first scroll pool |

### UX
| Doc | Status |
|-----|--------|
| [interaction-contract.md](ux/interaction-contract.md) | Accepted Build 1 UX contract |
| [screens-and-flows.md](ux/screens-and-flows.md) | Draft |
| [readability.md](ux/readability.md) | Draft |

### Art direction
| Doc | Status |
|-----|--------|
| [art/README.md](art/README.md) | Build 1 art workflow |
| [visual-style-bible.md](art/visual-style-bible.md) | Controlled draft pending anchor lock |
| [technical-asset-contract.md](art/technical-asset-contract.md) | Accepted Phase 0 production contract |
| [prompt-library.md](art/prompt-library.md) | Draft pending anchor validation |
| [asset-manifest.md](art/asset-manifest.md) | Active production inventory |
| [client-integration-reconciliation.md](art/client-integration-reconciliation.md) | Proposed implementation sequence |

### Product
| Doc | Status |
|-----|--------|
| [horizon.md](product/horizon.md) | Locked |
| [current-scope.md](product/current-scope.md) | Locked implementation scope |
| [decision-register.md](product/decision-register.md) | Active authority index |
| [future-compatibility-ledger.md](product/future-compatibility-ledger.md) | Architecture guardrails |
| [first-expedition-balance-walkthrough.md](product/first-expedition-balance-walkthrough.md) | Paper-model draft |
| [build-1-acceptance-plan.md](product/build-1-acceptance-plan.md) | Accepted final pre-architecture plan |
| [milestones.md](product/milestones.md) | Draft |
| [open-questions.md](product/open-questions.md) | Living |
| [tech-decision.md](product/tech-decision.md) | Locked |

### Architecture
| Doc | Status |
|-----|--------|
| [build-1-architecture.md](architecture/build-1-architecture.md) | Accepted Build 1 architecture decision |

### Templates
| Doc | Status |
|-----|--------|
| [templates/](templates/) | Locked structure |

## Writing order (spine)

1. Vision → 2. Loops → 3. Party & combat → 4. Cards / gear / spellcraft → 5. Map & events → 6. Haven & economy → 7. Content → 8. UX and art direction → 9. Multiplayer horizon → 10. Milestones → 11. Architecture (**accepted** — Build 1 implementation underway)
