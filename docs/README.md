# Nightfall Design Bible

In-repo source of truth for **what the game should be**. Implementation and tech-stack choices follow this bible — not the other way around.

**Audience:** you, future-you, and coding agents.  
**Product:** friends-hosted, not commercial. Solo first; async Havens + co-op PvE later.

## How to use

1. Read [`vision/north-star.md`](vision/north-star.md) first.
2. Read [`product/horizon.md`](product/horizon.md) for must / nice / dream / non-goals.
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

### Loops
| Doc | Status |
|-----|--------|
| [core-loop.md](loops/core-loop.md) | Locked |
| [run-structure.md](loops/run-structure.md) | Draft |
| [failure-and-torches.md](loops/failure-and-torches.md) | Draft |

### Systems
| Doc | Status |
|-----|--------|
| [party-and-roster.md](systems/party-and-roster.md) | Draft |
| [combat.md](systems/combat.md) | Draft |
| [cards-and-decks.md](systems/cards-and-decks.md) | Draft |
| [gear-and-affixes.md](systems/gear-and-affixes.md) | Draft |
| [spellcraft.md](systems/spellcraft.md) | Draft |
| [map-and-nodes.md](systems/map-and-nodes.md) | Draft |
| [events.md](systems/events.md) | Draft |
| [haven-buildings.md](systems/haven-buildings.md) | Draft |
| [economy.md](systems/economy.md) | Draft |
| [progression.md](systems/progression.md) | Draft |
| [gloom-and-stress.md](systems/gloom-and-stress.md) | Draft |
| [multiplayer.md](systems/multiplayer.md) | Draft |

### Content
| Doc | Status |
|-----|--------|
| [classes/](content/classes/) | Draft (3 starter briefs) |
| [regions/](content/regions/) | Draft (band-1…3 + name pools; legs ≠ bands) |
| [enemies/](content/enemies/) | Draft |
| [bosses/](content/bosses/) | Stub |
| [events/](content/events/) | Stub examples |

### UX
| Doc | Status |
|-----|--------|
| [screens-and-flows.md](ux/screens-and-flows.md) | Draft |
| [readability.md](ux/readability.md) | Draft |

### Product
| Doc | Status |
|-----|--------|
| [horizon.md](product/horizon.md) | Locked |
| [milestones.md](product/milestones.md) | Draft |
| [open-questions.md](product/open-questions.md) | Living |
| [tech-decision.md](product/tech-decision.md) | Locked |

### Templates & archive
| Doc | Status |
|-----|--------|
| [templates/](templates/) | Locked structure |
| [_archive/prototype-slice-notes.md](_archive/prototype-slice-notes.md) | Archive |
| [_archive/prototype-src/](_archive/prototype-src/) | Archive (frozen one-shot code) |
| [_archive/prototype-supabase/](_archive/prototype-supabase/) | Archive (old local Supabase config) |

## Writing order (spine)

1. Vision → 2. Loops → 3. Party & combat → 4. Cards / gear / spellcraft → 5. Map & events → 6. Haven & economy → 7. Content → 8. UX → 9. Multiplayer → 10. Milestones → 11. Tech decision (**locked** — greenfield scaffold next)
