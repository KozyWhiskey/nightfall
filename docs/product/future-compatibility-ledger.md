# Future Compatibility Ledger

**Status:** Active architecture guardrails
**Last updated:** 2026-07-19
**Related:** [Current Product Scope](current-scope.md), [Decision Register](decision-register.md), [Tech Decision](tech-decision.md)

## Purpose

Build 1 is not a disposable prototype. This ledger identifies the extension seams the solo vertical slice must preserve without implementing deferred systems early. A future item is a **constraint on data and boundaries**, not permission to add its UI, rules, content, or networking now.

| Future area | Build 1 must preserve | Explicitly not Build 1 |
|---|---|---|
| Three-hero parties and recruits | Party/entity collections, targeting, initiative, rewards, and UI layouts must not assume exactly two entities even though only two are playable. | Party selection, recruitment, third class implementation. |
| Co-op and host authority | All simulation changes enter as validated commands against authoritative state; deterministic RNG and snapshots are serializable. Local LAN profiles and session cookies are the Build 1 identity surface. | Cloud/OAuth/email accounts, lobby, WebSocket play, ownership UI, Need/Greed. |
| Summons and Blood magic | Combat entities support owner, tags, duration, HP, initiative, targetability, declarative HP/resource costs, and conditional effects. | Summon cards, lifesteal, Blood school content, special-case rules engine. |
| Full inventory and storage | Stable item IDs, item locations, stack quantities, ownership, and equipment-slot IDs; inventory views derive from these records. | Bag grids, weight, storage limits, sorting mechanics, trading UI. |
| More gear and classes | Data-driven slot, class, school, card-source, affix, and effect definitions; unknown IDs fail validation safely. | Shadowblade, subclasses, broad armor catalog, every school. |
| More regions and expeditions | Seeded map generation, region/band IDs, node types, encounter tables, discovery flags, and waypoint IDs are data-driven. | Bands 2-3, Shops, Elites, procedural breadth beyond Unlit Road. |
| Haven expansion, succession, and retirement | Buildings, blueprints, resources, survivor records, memorials, campaign-world discoveries, and individual Haven records use versioned identifiers. | Later building functions, reclaim expeditions, retirement/inheritance, broad recruit economy. |
| AI-assisted narrative/content | Simulation produces deterministic structured facts; generated presentation is cached and never becomes game truth. Content grammars validate generated candidates before publication. | Live AI mechanic generation, AI-resolved loot, uncached canon, model-required play. |
| Save migration and replay | Save payloads include schema/content versions, run seed, named RNG-stream state, and stable IDs. | Cloud sync, cross-device account migration. |
| UI scale and accessibility | UI consumes snapshots/view models, not rules internals; all effect sources and state changes have readable labels. | Final art pipeline, controller support, localization production. |

## Non-negotiable Build 1 guardrails

1. No React/UI code decides combat, loot, Gloom, crafting, or persistence outcomes.
2. No gameplay randomness comes from `Math.random()`; named deterministic streams own all rolls.
3. No feature stores truth only in presentation state; all durable state is in the simulation/Haven model.
4. Effects are declarative data interpreted by the simulation, not one-off UI callbacks.
5. New content is additive data wherever possible; saved item/card/hero IDs remain stable after release.

## Backlog (intentionally undesigned)

- Co-op, cloud/OAuth/email accounts, and async Haven visibility.
- Shadowblade, recruit archetypes, subclasses, and additional schools.
- Blood magic, lifesteal, summons, permanent auras, and advanced conditions.
- Shops, Elites, extra regions, bosses, long greed chains, and deep crafting tiers.
- Inventory capacity, storage logistics, retirement/inheritance, and advanced Haven buildings.
- AI-authored narrative expansion and curated procedural-content pipelines.

Before promoting a backlog item into development, create an owning specification and add its approved rules to the Decision Register.
