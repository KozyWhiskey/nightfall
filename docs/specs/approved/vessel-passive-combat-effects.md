# Registry vessel passives must apply in combat

**Kind:** bug  
**Status:** approved  
**Last updated:** 2026-08-21  
**Decision Register:** `content.pack`  
**Related:** [Build 1 Content Registry](../../content/vertical-slice-content-registry.md), [Combat Simulation Contract](../../systems/combat-simulation-contract.md) (damage formula / start-of-combat effects), [Content Data Contract](../../systems/content-data-contract.md)

## Summary

Three approved vessels advertise combat passives that the simulation never applies. Archivist's Focus (`combat_start_draw`) still refills to hand size 3. Cracked Way-Lens (`spell_damage_flat`) copies `damageDelta` only onto a granted card, and the lens grants none. Ironweave Gloves (`basic_attack_damage`) never reach Basics because `useBasicAttack` calls `playDefinition` without a card instance. Players see the passives on the item sheet and take no combat effect.

## Authority

Decision Register `content.pack` — Build 1 loads the accepted finite registry. Content Registry vessels:

> `archivists_focus` … passive: `combatStartDraw:+1`  
> `cracked_way_lens` … relic … passive: `spellDamageFlat:+1`  
> `ironweave_gloves` … gloves … passive: `basicAttackDamageFlat:+1`

Combat Simulation Contract damage formula:

> physical raw damage = cardBaseDamage + STR + flat bonuses  
> spell raw damage = cardBaseDamage + INT + flat bonuses

Setup order step 7 applies start-of-combat effects after the timeline exists. Affix pool restates Archivist's Focus as "Draw +1 card at combat start" (once per combat, not every refill).

## Classification rationale

`bug` — accepted registry mechanics are display-only. No new player rule. `grantRetain` is an Umbra card effect on held-only `borrowed_moment` (learning deferred), not a vessel passive; leave it out. Working passives (`max_hp`, `max_stamina`, `item_initiative`, `retain_refill`) stay as-is.

## Package touch list

- `packages/sim/src/combat.ts` — first-turn extra draw; spell flat bonus on spell cards; basic-attack flat bonus on Basics
- `packages/sim/src/items.ts` — if mechanic snapshots need a real damage/draw field instead of a label-only modifier (optional, only if combat reads it)
- `packages/fixtures/src/sim-combat.test.ts` — `SIM-C04`, `SIM-C05`, `SIM-C06` (failing until the fix)

## Acceptance criteria

- [ ] `SIM-C04`: Weaver with `archivists_focus` equipped has 4 cards in hand on their first combat turn (deck has at least 4 cards). Later refills in that combat stay at hand size 3 unless other rules apply
- [ ] `SIM-C05`: Weaver with `cracked_way_lens` plays Aether Bolt for 12 damage (7 + INT 4 + 1), not 11. Physical Basics on that hero stay at 1 + STR
- [ ] `SIM-C06`: Vanguard with `ironweave_gloves` deals 6 with Basic Attack (1 + STR 4 + 1), not 5. Spell cards on that hero are unchanged by the gloves
- [ ] Named streams only; never `Math.random()`
- [ ] `pnpm test` covers the change
- [ ] `pnpm check:boundaries` still passes
- [ ] Out of scope listed below is untouched

## Out of scope

- Umbra `grantRetain` / `borrowed_moment` learning
- Other label-only affixes (`exposed_damage_plus_2`, `first_burn_plus_1`, `guard_self_block`, `ally_downed_block`, `veiled_road` combat-start-draw affix unless it shares the same draw path)
- Injury penalties, Strain duration, Poison, revival cards
- Implementing the passives in this scout PR beyond the failing fixtures

## Test plan

`pnpm vitest run packages/fixtures/src/sim-combat.test.ts`

Helper: embark, equip the vessel onto the matching slot (unequip Weaver offhand for Focus; add one learned card so the Focus deck can actually hold 4), then `startCombat` with `combatInitiative: [0.9, 0.9, 0, 0]`.

- `SIM-C04`: assert Weaver hand length is 4 immediately after combat start.
- `SIM-C05`: put `aether_bolt` in hand, play at an unblocked hound, expect 12 HP damage.
- `SIM-C06`: `useBasicAttack` from Vanguard at an unblocked hound, expect 6 HP damage.

Browser is not correctness authority.

kind: bug
