# Events

**Status:** Draft  
**Last updated:** 2026-07-16  
**Related:** [map-and-nodes.md](map-and-nodes.md), [../templates/event-brief.md](../templates/event-brief.md)

## Goal

**Vertical-slice scope note:** Event logic is solo only in the current build. Co-op decision ownership and Elite-related rumor outcomes are future design.

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
| `settlement_trace` | Rare ruined-settlement / waypoint discovery. Major settlements reliably unlock one lasting possibility (recruit archetype, spell school, building blueprint, or item/affix family); ordinary waypoints may instead offer lore, map, or resource value. |

## Framework

Each event uses the [event-brief template](../templates/event-brief.md):

- Setup copy
- Choices table
- Mechanical effects
- Co-op decision rule

### Co-op default

Party discusses; the **embark leader** confirms the choice unless an event is tagged `per_player` (personal bargain).

## Content pipeline

1. Write brief in `content/events/`.
2. Tag regions and rarity.
3. Implement as data + resolver (tech later).
4. Playtest for “false choice” (one option always best).

## Acceptance criteria

- [ ] Solo vertical slice: 3–4 polished events, with one able to reveal a settlement trace
- [ ] Broader must-ship: at least 8 distinct events across early regions
- [ ] At least 2 events can add a roster survivor
- [ ] No event is only “gain 5 gold” with no flavor stake

## Open questions

- Repeatable events vs once-per-Haven flags
