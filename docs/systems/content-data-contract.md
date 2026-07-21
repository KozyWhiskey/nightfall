# Content Data Contract

**Status:** Accepted Build 1 shared content contract
**Last updated:** 2026-07-19
**Authority:** [Decision Register](../product/decision-register.md), [Combat Simulation Contract](combat-simulation-contract.md), and [Future Compatibility Ledger](../product/future-compatibility-ledger.md)

## Purpose

Definitions describe what can exist; instances record what actually happened. This separation lets Nightfall add content without rewriting simulation code or silently changing saved mechanics.

The content package contains immutable, validated definitions. Saves contain owned/generated instances with stable IDs, locations, rolled values, and resolved mechanic snapshots where generation is involved.

## Common definition shape

Every authored definition has:

```text
id                // stable snake_case identifier; never reused
contentVersion    // pack version that introduced or changed it
scope             // build1 | future
tags              // searchable categories, not executable logic
display           // name, short description, icon key, lore key
rules             // typed declarative data interpreted by simulation
```

Definitions contain no executable JavaScript, UI callbacks, or freeform AI mechanics.

## Declarative effect vocabulary

Cards, enemy intents, supplies, events, craft results, buildings, and rewards use validated effect definitions interpreted by the simulation.

| Group | Build 1 effect kinds |
|---|---|
| Combat damage/control | `dealDamage`, `gainBlock`, `removeBlock`, `applyCondition`, `removeCondition`, `createGuard` |
| Card/deck | `drawCards`, `grantRetain`, `exhaustCard`, `addTemporaryCard` |
| Resources/health | `restoreResource`, `heal`, `dealDirectDamage` |
| Expedition | `changeRunGloom`, `grantSupply`, `addExpeditionFlag`, `removeExpeditionFlag` |
| Rewards/progression | `grantItem`, `grantMaterial`, `grantBlueprint`, `grantDiscovery`, `grantTemporaryStatPoint` |
| Haven | `changePillar`, `changeHavenGloom`, `treatInjury`, `queueLeadershipPoint`, `constructBuilding` |

Every effect declares its values, target rule, duration where applicable, and conditional requirements in data. Presentation renders resolved facts; it does not implement effect logic.

## Card and effect schema

### Card definition

```text
id
contentVersion
scope
display
tags
kind                 // basic | attack | ability | spell
schools[]            // empty for universal/basic actions
cost                 // AP plus optional Mana or Stamina
targetSpec
effects[]            // ordered immediate effects
triggers[]           // optional temporary reactive rules
disposition          // discard | exhaust
```

Basics use this same schema with `kind: basic` and `alwaysAvailable: true`; they never enter a draw pile.

### Target specifications

Each card declares one target domain: combatant (`self`, chosen ally/enemy, all allies/enemies), deterministic combat selector (`lowestHpHero`, `lowestBlockHero`, `randomLivingHero`), card-in-hand, or none. A player command supplies a target only when the definition requires a player choice.

### Immediate and conditional effects

Effect definitions use typed fields. `dealDamage` declares damage type, baseline amount, scaling (`strength`, `intellect`, or `none`), and Block behavior. `gainBlock` records its own source layer. `applyCondition`, `removeBlock`, `createGuard`, `drawCards`, `grantRetain`, and resource/Haven effects use their corresponding declared fields.

Conditional behavior is declarative, for example: target has Exposed -> deal 3 additional damage. No card definition owns imperative callback code.

### Reactive triggers and Block layers

Some cards create a temporary trigger rather than only resolving immediate effects. A trigger declares its listened-for simulation fact, source filter, use limit, expiry, and ordered effects. Still Wall, for example, listens for an enemy damaging intent fully absorbed by the Block layer it created, then Weakens that enemy once.

Block is shown as one total but stored as individual layers:

```text
blockLayerId
sourceId
remainingAmount
createdAt
expiresAt
```

Damage consumes the most recently created Block layer first. This makes “this Block” triggers deterministic and prevents a Still Wall exception in simulation code.

### Card instances and enduring sources

| Source | Persistence |
|---|---|
| Class starter | Permanent personal card |
| Learned scroll | Permanent personal card after successful Return |
| Equipped item | Derived from the equipped item; disappears when unequipped |
| Run-created card | Exists only for its stated run/combat duration |
| Temporary effect card | Exists only for its stated combat duration |

Every card instance has a stable `cardInstanceId`, `definitionId`, source reference, and approved rolled modifiers. Combat state separately tracks its current card zone.

### Card validation

- Costs are whole nonnegative integers; every non-Basic playable card costs at least 1 AP.
- Build 1 cards may use only approved target domains, effect kinds, conditions, and triggers.
- A school-specific card requires a known school; universal cards do not.
- A card cannot declare an effect incompatible with its target type.
- Generated modifiers must pass the same effect, budget, and compatibility validation as authored definitions.

## Item, affix, and generated-instance schema

### Item definitions

Every item base declares `id`, `itemKind` (`equipment`, `scroll`, `supply`, `material`, `currency`, or `ember_shard`), equipment slot where applicable, tags, universal/required-school eligibility, base modifiers, injected-card references, allowed affix families, source/drop rules, and display data. The full nine-slot equipment sheet is valid in Build 1 even though most Head, Gloves, Legs, and Feet content arrives later.

### Equipment modifiers and affixes

Items and affixes use typed modifiers only: attribute, derived-resource, initiative, card modifier, trigger, expedition-rule, or curse. Prefixes, suffixes, curses, and Legendary signatures each declare `id`, affix kind, budget cost, compatibility, incompatibilities, modifiers, and display fragments.

Existing first-slice limits remain validation rules: Salvaged has zero affix budget; Imbued one; Rare two; Legendary two-to-three plus a signature. An item may have at most one draw/Retain module and one resource-capacity module. A curse requires a visible associated upside.

### Item instances and ownership

Every persistent instance stores these fields:

```text
instanceId
definitionId
itemKind
generationVersion
seed
rarityId
prefixIds / suffixIds / curseId / signatureId
mechanicSnapshot
displaySnapshot
location
owner/reference IDs
```

`mechanicSnapshot` is the resolved validated modifiers and injected-card changes used by simulation. A physical item has exactly one location:

```text
haven
held_by_expedition
equipped(heroId, slotId)
sealed_in_waypoint(waypointId)
carried_by_enemy(enemyId)
consumed
lost
```

### Injected equipment cards

An equipped item deterministically derives its injected cards from item instance and card definition IDs. The item remains the source of truth; swapping equipment cannot duplicate a permanent card. Its injected cards enter or leave the derived deck only at valid preparation moments, before the next combat.

### Marked carriers

At encounter generation, the `loot` stream creates the exact eligible item instance and moves it to `carried_by_enemy`. Its applicable modifiers affect that enemy. The enemy is visibly marked while affix details remain hidden. On defeat, the same instance moves into expedition holdings; no second roll occurs.

### Item validation

- Equipment has a valid slot and eligible wearer.
- Every affix is compatible with its base and does not conflict with another selected affix.
- Generated mechanics remain within rarity budget.
- Injected-card references and card modifiers validate.
- An item cannot occupy multiple locations, including both equipment and a waypoint chest.
- Build 1 rejects durability, bag weight, stack puzzles, and unimplemented future modifiers.

## Enemy, encounter, and boss schema

### Enemy definitions and intent modes

An enemy definition owns stable identity, display, tags/role, base stats, eligible carrier pools, and one intent mode: `weighted_random`, `tactical_weighted`, or `scripted_cycle`. Enemy intents use the same target and effect vocabulary as player cards but do not use a deck, AP, Mana, or Stamina.

| Mode | Build 1 use | Rule |
|---|---|---|
| `weighted_random` | Very simple enemies | Seeded weighted choice among valid intents. |
| `tactical_weighted` | Ordinary Band-1 enemies | Filter invalid intents, score useful intents, then seeded weighted choice among those remaining. |
| `scripted_cycle` | Bosses and special enemies | Follow authored cadence/branches. |

Each intent declares a telegraph label/icon, target specification, ordered effects, base weight where relevant, eligibility rules, scoring rules, target selector, and next-intent rule. Eligibility prevents nonsense such as healing a full-health ally. Scoring can prefer meaningful healing, an available damaging ally for a buff, low-HP defense, or an uncovered condition target. Enemies do not inspect a player's hand, future draw, or other hidden information.

After an enemy acts, its next intent is selected and revealed immediately. A revealed normal intent never silently changes in response to player actions.

### Next-intent rules

An intent may roll its pool, force a named next intent, branch on an explicit state predicate, or advance a scripted cycle. Spore `Swell` forces `Rupture`; Hound and Chanter setup actions create validated temporary triggers; Lantern-Smother branches based on whether its Shroud remains alive.

### Temporary combat entities

`createCombatEntity` is an approved content effect. It creates an entity with HP, owner/source, tags, initiative behavior, targetability, duration, and optional effects. Lantern-Smother's 18-HP Shroud is targetable, takes no normal turn, belongs to the boss, and lasts until destroyed or consumed. Future summons use the same entity schema; no boss-only exception is permitted.

### Encounter and carrier definitions

An encounter declares region/band tags, route eligibility, enemy entries, difficulty role, reward-table reference, and marked-carrier rules. It has no hidden scaling. At encounter generation, the instance records exact enemy spawns, initial intent rolls, reward table, and any carrier item.

Carrier rules declare chance, eligible enemies, eligible item pools, and display treatment. The `loot` stream selects a valid enemy and creates its exact item instance. Applicable item modifiers help that enemy; the visibly marked instance moves to expedition holdings on defeat with no reroll.

### Boss definitions

A boss is an enemy definition using `scripted_cycle`, plus boss reward table, waypoint outcome, script state variables, branch conditions, and temporary entity definitions. Boss scripts must expose each major telegraph before resolution.

### Enemy-content validation

- A weighted pool has positive weights and at least one valid intent.
- Forced, branched, and scripted next-intent references resolve.
- All targets and effects validate against the shared contract.
- Encounter enemy count is at most five in Build 1.
- Marked-carrier items validate for both selected enemy and item pool.
- Temporary entities define owner, targetability, duration, and timeline behavior.
- Boss scripts cannot dead-end or hide a major intent.

## Expedition node, event, and reward schema

### Routes, nodes, and edges

A route is an authored/generated graph with route ID, region/band ID, seed, node instances, edges, Boss node, Waypoint node, and Return nodes. Its seed selects allowed content at route creation and stores that result; reloading never rerolls fogged content.

Each node stores node ID, node type, visibility (`hidden`, `category_revealed`, or `resolved`), content reference/resolved content instance, outgoing edge IDs, and state (`available`, `entered`, `resolved`, or `locked`). Build 1 permits `combat`, `event`, `rest`, `safe_craft`, `boss`, `waypoint`, `return_combat`, and `return_event`; future node types fail Build 1 scope validation.

An edge declares source, destination, requirements, display state, and explicit `runGloomCost: 5`. Players see legal next edges and their Gloom cost. Event content remains fogged until entry; combat, Rest, and Craft category visibility follows the expedition contract.

### Events

An event declares ID, region tags, eligibility, setup text, and choices. Every choice owns display text, requirements/costs, guaranteed effects, optional weighted outcomes, risk disclosure, and follow-up flags.

Once entered, deterministic effects/costs are stated exactly. Random outcomes disclose possible result categories and exact probabilities. Event outcome rolls use only the `event` stream. Follow-up flags support later consequences, including Return events, without bespoke quest code.

### Rewards

A reward table builds rewards from guaranteed grants, fully identified offer slots, optional carrier grant, eligibility filters, and source tags.

- Standard combat grants its automatic material bundle and one choice from two fully identified offers.
- A marked carrier grants its exact carried item in addition to the normal choice.
- Boss grants blueprint, settlement trace, Ember Shard, construction cache, and one choice from three Rare-or-better gear offers.
- Return combat grants a lean material bundle plus a gear-versus-scroll choice.
- Events use authored effects rather than a generic bundle.

An offer must be useful to at least one current hero or explicitly valuable as a future/crafting/Haven asset. Offer generation may not create a silently unusable dead choice.

### Special nodes

- Rest owns the fixed Gloom reduction and approved RestAction definitions.
- Safe Craft exposes only recipes whose held inputs are valid.
- Waypoint owns chest state, protection rules, blueprint/discovery effects, and Return choices.
- Return references a normal encounter or event consequence; it cannot generate a second boss.

### Expedition-content validation

- A route graph has a legal path from Haven Gate to Boss, Waypoint, and Haven Return.
- Every edge has explicit Gloom cost and valid endpoints.
- Fog hides only approved information, never an untelegraphed mechanical penalty.
- Event choice requirements/outcomes validate; weighted outcomes total 100%.
- Reward generation produces the required number of valid distinct choices.
- Chest rules reject currencies/materials and enforce three sealed slots.
- Build 1 route validation enforces Unlit Road's required three pre-boss combats and permitted node types.

## Haven, crafting, progression, and resource schema

### Resources

Every resource declares stable ID, layer (`expedition` or `haven`), stackability, display, maximum where applicable, wipe behavior, and chest eligibility. Build 1 expedition resources are Salvage, Emberglass, Rations, and Ember Shards; Haven resources are Timber, Stone, and Wick. Gear, scrolls, and supplies are physical item instances rather than currencies.

### Buildings and blueprints

A building definition owns building ID, display, construction cost, prerequisites, initial state (`unavailable`, `available`, `built`, or `damaged`), actions, and future-upgrade references. A building action declares requirements, consumed inputs, confirmation text, and typed effects.

A blueprint stores blueprint ID, target building ID, state (`undiscovered`, `discovered`, or `built`), and source. Ember Vault and Wayfarer are discoverable blueprint-only targets in Build 1.

### Craft recipes

Each recipe declares recipe ID, context (`safe_craft`, `cinder_forge`, or `event`), input requirements, target requirements, outcome table, stabilizer rule, and displayed odds. Every outcome has exact probability and typed effects. Safe Fuse, Safe Imprint, Risky Overbind, and Ember Shard stabilization use this shared model.

Validation rejects recipes with unsafe consumption, probabilities not totaling 100%, invalid generated content, or undisclosed risk.

### Progression and injuries

Build 1 progression declares `temporaryLevelCap: 1`, temporary stat choices, a temporary-point trigger after the third victorious standard combat, successful-boss-Return Leadership trigger, one Leadership Point per surviving hero, Wardyard permanent-assignment context, and `respecAllowed: false`. Exact tuning is in [Vertical-Slice Tuning](../content/expeditions/vertical-slice-tuning.md).

An injury definition owns injury ID, source, effect, stacking policy, treatment eligibility, and treatment cost/action. Build 1 Injured, Wounded, and Drained use stable IDs referenced by Quiet House and Keep Watch.

### Post-return resolution

A successful Return and wipe use the exact transaction order in the [Expedition State Machine](expedition-state-machine.md). In particular, waypoint/world facts are committed on boss victory while ordinary physical rewards remain expedition holdings until Return or chest protection.

A wipe resolves its own package: lose party and unsealed holdings, preserve chest contents, snuff a pillar, change Haven Gloom, add memorial state, and create final-pillar failure context only when the final pillar falls.

### Haven-content validation

- Building/action costs use valid resource IDs and prerequisites.
- A blueprint target exists and cannot be built twice.
- Recipe inputs, outcomes, and stabilizer paths validate.
- Progression respects Build 1 temporary/permanent caps.
- Treatment references valid injuries and removal effects.
- Return resolution cannot duplicate, lose, or assign conflicting item ownership.
- Future building, retirement, and subclass data may exist but Build 1 scope rejects their actions.

## Core definition types

| Type | Owns |
|---|---|
| Class | Base stats, schools, starter-card references, equipment eligibility |
| Card / Basic action | Cost, target rule, ordered effects, discard/exhaust behavior |
| Item base | Slot, eligibility, injected cards, base modifiers |
| Affix / curse / Legendary signature | Compatibility, budget cost, declarative modifiers/effects |
| Enemy | Stats, intent pool, target selectors, display data |
| Encounter | Enemy composition, reward focus, marked-carrier rules |
| Boss | Enemy plus scripted intent cadence and reward contract |
| Event | Eligibility, choices, requirements, disclosed effects/risk |
| Node / route | Map placement, visibility, available content pools |
| Reward table | Fully identified offer construction and material bundles |
| Craft recipe | Inputs, validation, outcome table, exact probabilities |
| Building | Costs, prerequisites, actions unlocked |
| Resource / condition | Stable IDs, display metadata, rules parameters |

## Validation gates

The content package rejects invalid definitions before a run begins:

- Duplicate or missing IDs/references.
- Unsupported effect kinds or target rules.
- Invalid item slot, school, condition, or resource IDs.
- Future-only capability used in Build 1 content.
- Craft probabilities that do not total 100%.
- Card costs/effects outside approved data ranges.
- Generated item/spell combinations exceeding affix budget or incompatibility rules.
- Any definition attempting arbitrary code execution.

## Save-safe versioning

- Definitions are additive wherever possible.
- A persistent generated instance stores `definitionId`, `generationVersion`, and `mechanicSnapshot`.
- Display/lore may refresh safely; mechanics never change silently for an active save.
- A content-pack hash is recorded on every save and replay.
- Removed or behavior-changing definitions require an explicit migration or legacy compatibility entry.

## Card-zone contract

Each hero's combat deck uses five explicit zones: `draw`, `hand`, `discard`, `exhaust`, and `temporary`. The combat snapshot stores the ordered contents of every zone.

- At combat start, build the deck from valid card sources in fixed source order, then shuffle it with the named `combatDeck` RNG stream.
- On a normal play, resolve effects and move the card to `discard`.
- On an Exhaust play or an explicit exhaust effect, move the card to `exhaust` instead. Exhausted cards never return to draw during that combat.
- When a draw/refill effect needs a card and `draw` is empty, shuffle every card in `discard` into `draw` using `combatDeck`, then clear `discard`.
- If both `draw` and `discard` are empty, no card is drawn; the simulation never creates a replacement card.
- A retained card stays in `hand` and counts toward its next normal hand refill.
- At combat end, discard, exhaust, and temporary-zone state ends. The next combat rebuilds the deck from its enduring sources, so a card exhausted in one combat returns for the next unless its definition or a persistent effect explicitly says otherwise.

This contract applies equally to natural hand refills and explicit draw effects. Every shuffle advances only the `combatDeck` stream and is therefore replay-safe.

## Future capability boundary

The schema may describe future effects and capabilities, but Build 1 validation permits only the effect vocabulary and capability set approved here. A summon-capable entity model, for example, does not authorize a Build 1 card to create a summon.
