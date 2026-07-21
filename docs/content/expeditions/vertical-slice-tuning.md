# Vertical-Slice Tuning Table and Test Matrix

**Status:** Accepted initial Build 1 tuning data — playtest-tunable
**Last updated:** 2026-07-19
**Authority:** This document owns numeric values marked as balance data in the first expedition, events, rewards, crafting, and temporary progression. Values are playtest-tunable, but any change must be recorded here with its test reason.
**Related:** [The Unlit Road](the-unlit-road.md), [Vertical-Slice Rewards](vertical-slice-rewards.md), [Vertical-Slice Crafting](../crafting/vertical-slice-crafting.md), [Balance Reference](../../systems/balance-reference.md)

## Calibration rules

- Values are data, not code constants. The first implementation must load them by stable ID.
- A disclosed probability is exact for the active content version; no visible event or craft choice uses an undisclosed roll.
- Each hero earns one temporary expedition point after the party's **third victorious standard combat**. It is assigned immediately to VIT, DEX, STR, or INT and is limited to one per hero per expedition.
- The named `loot`, `event`, and `craft` RNG streams own every listed roll.

## Combat baseline data

These stable IDs are loadable content data. The simulation consumes them; the Combat Simulation Contract owns their formulas and timing, not their Build 1 numeric values.

| Definition ID | VIT | DEX | STR | INT | Base HP | Base Stamina | Base Mana |
|---|---:|---:|---:|---:|---:|---:|---:|
| `class.vanguard` | 4 | 3 | 4 | 1 | 22 | 6 | 2 |
| `class.aether_weaver` | 4 | 5 | 2 | 4 | 12 | 2 | 6 |

| Definition ID | Value |
|---|---|
| `combat.initiative_variance` | Inclusive integer range `1..4`. |
| `combat.victory_resource_recovery` | Restore `50%` of each hero's maximum Mana and Stamina after victorious combat. |
| `combat.gloom_touched_block` | `3` special Gloom Block; expires at its owner's second turn. |

## Standard combat rewards

Every listed combat grants its automatic bundle and then one chosen valuable offer from two identified alternatives. `Emergency Cache` is a supply offer; it replaces one normal alternative rather than being additional free loot.

| Combat | Automatic bundle | Gear / scroll offer | Gear rarity roll | Emergency Cache chance |
|---|---|---|---|---:|
| 1 Roadside Trail | 2 Salvage, 1 Emberglass, 1 Timber, 1 Stone, 1 Ration | one gear, one scroll | 85% Salvaged / 15% Imbued | 0% |
| 2 Lost Mile | 2 Salvage, 1 Emberglass, 1 Timber, 1 Stone | two scroll-weighted | 80% Salvaged / 20% Imbued | 10% |
| 3 Whisperwood Threshold | 2 Salvage, 1 Emberglass, 1 Timber, 1 Stone | one gear, one scroll | 80% Salvaged / 20% Imbued | 10% |
| 4 Rootbound Remains | 3 Salvage, 1 Emberglass, 1 Timber, 1 Stone | two gear-weighted | 70% Salvaged / 25% Imbued / 5% Rare | 15% |
| 5 Houndpack in the Fog | 3 Salvage, 2 Emberglass, 1 Timber, 1 Stone | two scroll-weighted | 65% Salvaged / 30% Imbued / 5% Rare | 20% |
| 6 Stalking Choir | 4 Salvage, 2 Emberglass, 1 Timber, 1 Stone | one gear, one strong scroll | 50% Salvaged / 35% Imbued / 15% Rare | 25% |
| 7 Lantern Approach | 4 Salvage, 2 Emberglass, 1 Timber, 1 Stone | one gear, one scroll | 45% Salvaged / 35% Imbued / 20% Rare | 50% |
| Return Roadwardens | 2 Salvage, 1 Emberglass, 1 Timber, 1 Stone | one gear, one scroll | 70% Salvaged / 25% Imbued / 5% Rare | 0% |

An Emergency Cache offers one identified supply: 50% Mana Phial, 30% Stamina Draught, 20% Ash Tonic. A player may choose the normal alternative instead. The listed rates yield about one supply opportunity on a typical route and roughly 1.3 on a combat-forward route before event opportunities.

Marked-item-carrier chances and boss rewards remain exactly as authored in [The Unlit Road](the-unlit-road.md) and [Vertical-Slice Rewards](vertical-slice-rewards.md). Each of the boss's three gear offers rolls 85% Rare / 15% Legendary.

`return_roadwardens` never has a marked carrier. It is the Return Combat named in the content registry; `returning_echo` is the mutually exclusive Return Event.

## Event resolution data

### The Last Courier

| Choice | Exact requirement and result |
|---|---|
| Escort them | Spend 1 Ration. Set `courierEscorted`; the next Rest has `restGloomModifier:-6`, reducing the disclosed base 12 Gloom by an effective 6. On successful Return, gain 2 Emberglass and the permanent `courier_contact` discovery. |
| Take the ledger | Gain `courier_ledger`, add 8 Run Gloom, and make the next combat reward show three identified alternatives instead of two. |
| Feed the lantern | Spend 1 Emberglass, reduce Run Gloom by 12, and both heroes start their next combat with 3 Block. |

### The Fallen Waystation

| Choice | Exact requirement and result |
|---|---|
| Rekindle the signal | Spend 2 Emberglass, reduce Run Gloom by 15, and make the next combat reward show three identified alternatives instead of two. |
| Salvage the lens | Gain one generated Imbued relic, add 5 Run Gloom; it has a 25% chance to carry `Frayed`. |
| Enter the memory loop | 65%: present one Rare scroll offer. 35%: both heroes begin their next combat Exposed. The result category and probability are displayed before confirmation. |

### Choir in the Bark

| Choice | Exact requirement and result |
|---|---|
| Carve the names free | Reduce Run Gloom by 10; both heroes start their next combat with 3 Block; 50% chance that one seeded random hero starts that combat Strained. |
| Follow a familiar voice | 40%: one Rare scroll offer. 30%: one generated Imbued relic. 30%: immediately enter `mire_imp + gloomfang_hound` ambush combat. Display the three categories/probabilities before confirmation. |
| Cut the black resin | Gain `unstable_resin`. The next Safe Fuse needs only one unlearned scroll, but its created card always gains `Frayed`. The resin expires on successful Return or wipe. |

### Cache: Ember Pit

| Choice | Exact requirement and result |
|---|---|
| Haul carefully | Add 3 Emberglass, add 5 Run Gloom, and gain one `safe_fuse_voucher` (the next Safe Fuse costs no Emberglass). |
| Dig greedy | Add 6 Emberglass, add 5 Run Gloom, and deal 3 direct damage to each living hero. |
| Toss a scroll into the pit | Consume 1 unlearned scroll and choose one eligible equipped item or learned card. Resolve a free Risky Overbind using the table below; no Emberglass is required. |

## Crafting values

| Recipe | Inputs | Outcomes |
|---|---|---|
| Safe Fuse | 2 compatible unlearned scrolls + 2 Emberglass (or one scroll + `unstable_resin`; voucher waives Emberglass) | 75% desired hybrid; 25% desired hybrid with Overdrawn. |
| Safe Imprint | 1 unlearned scroll + 1 gear item + 1 Emberglass | 75% desired imprint; 25% desired imprint with Overdrawn. |
| Risky Overbind | 1 eligible learned card or equipped item + 1 unlearned scroll + 3 Emberglass | 55% strong improvement; 25% improvement + Overdrawn; 15% improvement + Frayed; 5% improvement + Hollow. |

Spending one Ember Shard on Risky Overbind changes only the 5% Hollow result to improvement + Frayed. It does not alter the other result weights and never produces a brick/item deletion in Build 1.

## Initial playtest targets

These ranges evaluate the intended starting loadouts with no preserved learned cards and no above-Imbued player gear. They are tuning guardrails, not difficulty promises.

| Scenario | Target outcome |
|---|---|
| Roadside Trail | 90–97% first-attempt victory; no expected Downed hero; 2–4 combat rounds. |
| Required pre-boss route | 75–90% boss arrival in a fresh Haven; at least one meaningful resource/rest/reward tradeoff. |
| Lantern-Smother after a typical route | 60–75% victory on first attempts; Shroud destroyed in 50–70% of wins. |
| Successful Return after boss victory | 80–90% survival; Return is pressure, not a second boss. |
| Full fresh-Haven expedition | 55–70% successful Return initially; improve through player learning and Haven decisions, not hidden scaling. |
| Combat-forward versus cautious route | Combat-forward yields 1–2 more meaningful offers on average, while reaching the boss with materially lower HP/resources or higher Gloom. |

For each test seed, record route, command log, Gloom after every edge/choice, combat rounds, HP/resource state, supplies used, downs/injuries, reward decisions, boss-Shroud outcome, and terminal result. Change one data value per test hypothesis; never compensate for a hard encounter by silently altering unrelated enemy statistics.

## Completion checklist

- [ ] Reward generator implements the listed source/rarity/supply weights.
- [ ] Event UI renders every listed cost, probability, and delayed consequence before confirmation.
- [ ] Temporary progression awards one point to each living hero after standard-combat victory three, never twice.
- [ ] Craft UI uses the listed inputs and result table, including the Ember Shard conversion.
- [ ] Seeded test fixtures cover each event result branch, every craft result, marked carrier, boss Shroud outcome, successful Return, wipe, and final-pillar succession.
