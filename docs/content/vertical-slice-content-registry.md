# Build 1 Content Registry

**Status:** Accepted loadable Build 1 content pack
**Content version:** `nightfall.vslice.1`
**Last updated:** 2026-07-19
**Related:** [Content Data Contract](../systems/content-data-contract.md), [Vertical-Slice Tuning](expeditions/vertical-slice-tuning.md), [Starter Kits](classes/vertical-slice-starter-kits.md), [Affix Pool](items/vertical-slice-affix-pool.md)

## Purpose

This registry turns the approved first-slice design into a finite, data-loadable pack. It does not repeat all player-facing copy; it declares stable IDs, content sources, and the constraints a validator must enforce. Every listed definition belongs to `nightfall.vslice.1`. Adding a future class, item, region, or effect must be additive rather than editing these IDs into a different meaning.

## Pack manifest

| Definition type | Count | Build 1 contents |
|---|---:|---|
| Classes | 2 | Vanguard, Aether Weaver |
| Basic actions | 4 | One attack/block pair per class |
| Starter class cards | 4 | Two per class |
| Equipment cards | 6 | Four weapons and two card-granting offhands; Focus uses a passive |
| Learnable scroll cards | 8 | Iron, Bastion, Aether, Ember |
| Held-only scroll cards | 2 | Umbra, not learnable in Build 1 |
| Base vessels | 13 | Four main hands, three offhands, three relics, three armor pieces |
| Affixes / curses | 8 prefixes, 8 suffixes, 3 curses | Applicability is bounded below |
| Legendary templates | 3 | Curated signature + generated supporting affixes |
| Enemy definitions | 5 | Hound, Husk, Imp, Chanter, Spore |
| Encounter definitions | 7 standard + 1 Return + 1 event ambush | Unlit Road slots and Choir result |
| Events | 5 | Four expedition events plus one Return Event; excludes archived Lantern Child |
| Recipes | 3 | Safe Fuse, Safe Imprint, Risky Overbind |

The armor sheet has five reserved slots. Build 1 generates one Head, Body, and Gloves vessel; Legs and Feet remain valid empty slots. Future armor content must use the same item/slot schema.

## Classes and card ownership

| Class ID | Schools | Base cards | Starter vessel IDs | Basic action IDs |
|---|---|---|---|---|
| `vanguard` | `iron`, `bastion` | `shield_bash`, `hold_the_line` | `hewn_sword`, `kite_shield` | `vanguard_basic_attack`, `vanguard_basic_block` |
| `aether_weaver` | `aether`, `ember` | `aether_bolt`, `ember_spark` | `aether_rod`, `way_lantern_buckler` | `weaver_basic_attack`, `weaver_basic_block` |

The classes' starting attributes, base pools, and initiative-variance range are the stable tuning definitions in [Vertical-Slice Tuning](expeditions/vertical-slice-tuning.md). The registry owns their IDs and sources; the tuning pack owns their numeric values.

Basics use `alwaysAvailable: true`; all other cards enter the deck only through their stated class, equipped vessel, learned scroll, or crafting source.

## Card definitions

Card damage bases are compatible with the formulas in the Combat Simulation Contract. `duration: targetNextCompletedTurn` means the condition ends at the end of the target's next completed turn.

| ID | Source / target | Cost | Ordered effects |
|---|---|---|---|
| `vanguard_basic_attack` | Basic / one enemy | 1 AP | `dealDamage(physical, base:1)` |
| `vanguard_basic_block` | Basic / self | 1 AP | `gainBlock(6)` |
| `shield_bash` | Vanguard / one enemy | 1 AP, 1 Stamina | `dealDamage(physical, base:0)`; `applyCondition(weakened, duration:targetNextCompletedTurn)` |
| `hold_the_line` | Vanguard / one ally | 1 AP, 1 Stamina | `gainBlock(4)`; `createGuard(source:self, protected:target, expiry:sourceNextTurnStart)` |
| `iron_cut` | Hewn Sword / one enemy | 1 AP, 2 Stamina | `dealDamage(physical, base:5)` |
| `brace` | Kite Shield / self | 1 AP, 1 Stamina | `gainBlock(10)` |
| `weaver_basic_attack` | Basic / one enemy | 1 AP | `dealDamage(physical, base:1)` |
| `weaver_basic_block` | Basic / self | 1 AP | `gainBlock(4)` |
| `aether_bolt` | Weaver / one enemy | 1 AP, 2 Mana | `dealDamage(aether, base:7)` |
| `ember_spark` | Weaver / one enemy | 1 AP, 1 Mana | `dealDamage(ember, base:0)`; `applyCondition(burn, stacks:1, duration:2TargetTurns)` |
| `aether_lash` | Aether Rod / one enemy | 1 AP, 1 Mana | `dealDamage(aether, base:2)` |
| `flare_ward` | Way-lantern Buckler / self | 1 AP, 1 Mana | `gainBlock(7)` |
| `piercing_thrust` | Gloomwood Spear / one enemy | 1 AP, 1 Stamina | `dealDamage(physical, base:2)`; `applyCondition(exposed, duration:targetNextCompletedTurn)` |
| `ember_lance` | Cinder Scepter / one enemy | 1 AP, 2 Mana | `dealDamage(ember, base:3)`; `applyCondition(burn, stacks:1, duration:2TargetTurns)` |

The eight learnable and two held-only scroll definitions use their existing IDs and values from [First Scroll Pool](spells/first-scroll-pool.md). The validator must reject learning `black_thread` or `borrowed_moment` because `umbra` is not an unlocked Build 1 school. `aether_needle` declares `bypassBlock: true`; `still_wall` creates a one-combat reactive `still_wall_ward` condition that weakens the first enemy whose direct damage is fully absorbed by the owner's Block.

## Vessel definitions and passive effects

| Vessel ID | Slot | Required school | Granted card / passive |
|---|---|---|---|
| `hewn_sword` | `mainHand` | none | `iron_cut` |
| `gloomwood_spear` | `mainHand` | none | `piercing_thrust` |
| `aether_rod` | `mainHand` | `aether` | `aether_lash` |
| `cinder_scepter` | `mainHand` | `ember` | `ember_lance` |
| `kite_shield` | `offHand` | none | `brace` |
| `way_lantern_buckler` | `offHand` | `aether` or `ember` | `flare_ward` |
| `archivists_focus` | `offHand` | `aether` | passive: `combatStartDraw:+1` |
| `cracked_way_lens` | `relic` | none | passive: `spellDamageFlat:+1` |
| `pilgrims_knot` | `relic` | none | passive: `maxStamina:+1` |
| `name_thread_charm` | `relic` | none | passive: first retained card each combat does not count against end-turn refill |
| `emberglass_cowl` | `head` | none | passive: `itemInitiative:+1` |
| `wayfarers_coat` | `body` | none | passive: `maxHp:+3` |
| `ironweave_gloves` | `gloves` | none | passive: `basicAttackDamageFlat:+1` |

`emberglass_cowl`, `wayfarers_coat`, and `ironweave_gloves` are the entire Build 1 armor pool. Legs and Feet have no generated vessel. The three armor pieces inject no card, and therefore accept only compatible passive/trigger affixes; attack- or spell-card affixes are rejected.

`archivists_focus` and `name_thread_charm` are valid even though they inject no card. The deck builder must accept an equipment source that contributes a passive only.

## Procedural item rules

### Affix allocation

| Rarity | Affix rule | Curse rule |
|---|---|---|
| Salvaged | No affix | None |
| Imbued | 70% one valid prefix; 30% one valid suffix | None |
| Rare | One valid prefix + one valid suffix | 15% chance, only when a visible upside remains |
| Legendary | One curated template signature + one valid prefix + one valid suffix | 25% chance, only when a visible upside remains |

When a category has several compatible modules, select uniformly among valid entries after incompatibility filtering. A source may further constrain the allowed vessel/rarity, but may never exceed the source rarity table.

### Exact first-pool effects

| ID | Rule |
|---|---|
| `cinderbound` | The vessel's granted damaging card applies 1 Burn. |
| `warded` | The vessel's granted Block card gains +2 Block. |
| `conduit` | The vessel's granted spell card gains +1 calculated damage. |
| `quickened` | `itemInitiative:+1`. |
| `anchored` | The vessel's granted card gains Retain. |
| `deepdrawn` | `maxStamina:+1` for physical/universal vessels; `maxMana:+1` for spell vessels. Armor uses the physical/universal result. |
| `houndmarked` | The vessel's granted attack gains +2 calculated damage against Exposed targets. |
| `lumenforged` | The first Block effect granted by this item each combat gains +2 Block. |
| `last_watch` | When this hero creates Guard, gain 2 Block. |
| `cinders` | The first Burn applied by this vessel's granted card each combat gains +1 additional stack. |
| `hound` | The first vessel-granted attack against an Exposed enemy each combat costs 1 less of its secondary resource, minimum 0. |
| `long_vigil` | The first retained vessel-granted card each combat costs 1 less secondary resource, minimum 0. |
| `broken_gate` | The owner's Basic Block gains +1 Block. |
| `veiled_road` | `combatStartDraw:+1`. |
| `ashen_names` | When an ally becomes Downed, gain 4 Block. |
| `waystation` | The first time an Event would add Run Gloom, reduce that increase by 5, minimum 0. |
| `frayed` | The vessel's granted/injected card deals 1 direct damage to its caster on play. |
| `hollow` | The vessel's granted/injected card Exhausts after use. |
| `overdrawn` | The vessel's granted/injected card costs +1 of its existing secondary resource. If it has none, it is ineligible. |

Reject `anchored + long_vigil`, `veiled_road + archivists_focus`, duplicate draw/retain modules, and every module that lacks an applicable granted card/passive. A cursed instance must show its curse before selection and must have at least the affix/signature upside that justified it.

### Legendary templates

| Template ID | Base restriction | Signature |
|---|---|---|
| `lantern_wardens_oath` | `kite_shield` or `way_lantern_buckler` | `vigils_promise`: Guard grants the protected ally 2 Block. |
| `scorched_conduit` | `aether_rod` or `cinder_scepter` | `cinder_scar`: enemies with Burn deal 1 less calculated damage. |
| `hounds_remembrance` | `gloomwood_spear` | `hounds_pursuit`: the first time each combat an enemy becomes Exposed, draw 1 card. |

## Encounter registry

| Encounter ID | Members | Source slot |
|---|---|---|
| `roadside_trail` | 2 `gloomfang_hound` | Combat 1 |
| `lost_mile` | `mire_imp`, `gloomfang_hound` | Combat 2 |
| `whisperwood_threshold` | `mist_chanter`, `gloomfang_hound`, `shattered_husk` | Combat 3 |
| `rootbound_remains` | `shattered_husk`, `mire_imp` | Combat 4 |
| `houndpack_fog` | 2 `gloomfang_hound`, `mist_chanter` | Combat 5 |
| `stalking_choir` | `gloom_spore`, `mist_chanter`, `gloomfang_hound` | Combat 6 |
| `lantern_approach` | `gloom_spore`, `shattered_husk` | Combat 7 |
| `return_roadwardens` | `mire_imp`, `gloomfang_hound` | Return Combat |
| `voice_ambush` | `mire_imp`, `gloomfang_hound` | Choir in the Bark result |

Each standard encounter uses the marked-carrier chance and reward source ID of its map slot. Carrier eligibility is exactly the table in [The Unlit Road](expeditions/the-unlit-road.md); a carrier rolls an item before combat and attaches the actual instance to the appropriate enemy.

## Event, recipe, and route references

| Definition kind | IDs |
|---|---|
| Events | `last_courier`, `fallen_waystation`, `choir_in_the_bark`, `cache_ember_pit`, `returning_echo` |
| Recipes | `safe_fuse`, `safe_imprint`, `risky_overbind` |
| Route | `unlit_road` |
| Boss | `lantern_smother` |
| Waypoint | `whisperwood_waypoint` |

The archived `survivor_lantern_child` is excluded from the manifest and validation. Event choices, recipe outcomes, node placement, Gloom values, and rewards are supplied by [Vertical-Slice Tuning](expeditions/vertical-slice-tuning.md).

## Validation checklist

- [ ] Every card effect and item modifier maps to a declared effect/trigger in the shared content contract; no text-only mechanics exist.
- [ ] Every card source is legal for at least one Build 1 hero or deliberately tagged `heldOnly`.
- [ ] Every generated item has compatible slot, school requirement, affix, curse, display, and stable instance location.
- [ ] Every encounter member, event result, craft target, reward offer, and route node resolves to an ID in this manifest.
- [ ] Content loading rejects the archived event, future schools, armor vessels, and future Legendary signatures unless a later content version explicitly enables them.
