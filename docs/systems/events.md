# Events

**Status:** Draft  
**Last updated:** 2026-07-16  
**Related:** [map-and-nodes.md](map-and-nodes.md), [../templates/event-brief.md](../templates/event-brief.md)

## Goal

Narrative and mechanical forks that deliver survivors, resources, rumors, and hard choices — not flavor text alone. Resolving events also **holds back the Gloom**; skipping them too often lets it creep (see [gloom-and-stress.md](gloom-and-stress.md)).

## Player-facing rules

- Landing on an **event** node opens a dedicated event UI (not an instant toast).
- Events present **2–3 choices** with visible costs when fair; mystery allowed when thematic.
- Outcomes can affect: HP/resources, cards, roster recruits, Haven flags, map rumors, scars.

## Event categories (content tags)

| Tag | Examples |
|-----|----------|
| `survivor` | Rescue, refuse, escort risk |
| `resource` | Salvage cache, taxed by Gloom |
| `rumor` | Unlocks map branch / elite mark |
| `craft_boon` | Safe-tier free mod |
| `corruption` | Power now, Haven risk later |
| `stranger` | One-run ally offer |
| `scroll_extract` | `??` mystery — send a held scroll home early (cost/risk) |

## Framework

Each event uses the [event-brief template](../templates/event-brief.md):

- Setup copy
- Choices table
- Mechanical effects
- Co-op decision rule

### Co-op default

**Proposal:** party discusses; **embark leader** confirms choice unless an event is tagged `per_player` (personal bargain).

## Content pipeline

1. Write brief in `content/events/`.
2. Tag regions and rarity.
3. Implement as data + resolver (tech later).
4. Playtest for “false choice” (one option always best).

## Acceptance criteria

- [ ] At least 8 distinct must-ship events across early regions
- [ ] At least 2 events can add a roster survivor
- [ ] No event is only “gain 5 gold” with no flavor stake

## Open questions

- Repeatable events vs once-per-Haven flags
