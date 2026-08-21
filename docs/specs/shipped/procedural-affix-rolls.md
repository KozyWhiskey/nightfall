# Procedural affix rolls from content registry

**Kind:** bug  
**Status:** shipped  
**Last updated:** 2026-08-21  
**Decision Register:** `none — bug vs accepted contract` (`content.pack` / vertical-slice-content-registry Affix allocation)  
**Related:** [Build 1 Content Registry](../../content/vertical-slice-content-registry.md), [Procedural Forge](../../content/items/procedural-forge.md), [Combat Simulation Contract](../../systems/combat-simulation-contract.md)

## Summary

Reward, boss, carrier, and event-granted gear currently stamp hardcoded `quickened` / `broken_gate` (plus a fixed boss signature), ignoring the accepted rarity budgets and compatibility filters in the content registry. Players see reskins of one Magix template instead of combinatorial “Cinderbound … of the Hound” identity. This change implements seeded affix allocation from `pack.affixes` on the named `loot` stream so Imbued/Rare/Legendary drops vary honestly.

## Authority

Content registry Affix allocation:

| Rarity | Affix rule | Curse rule |
|---|---|---|
| Salvaged | No affix | None |
| Imbued | 70% one valid prefix; 30% one valid suffix | None |
| Rare | One valid prefix + one valid suffix | 15% chance when upside remains |
| Legendary | One curated signature + one valid prefix + one valid suffix | 25% chance when upside remains |

Reject incompatible modules (`anchored`+`long_vigil`, modules that require a granted card when none applies, tag mismatches, Overdrawn without secondary cost). Selection is uniform among valid entries after filtering. Named RNG stream: `loot` only.

## Classification rationale

**bug** — accepted `content.pack` / registry rules already define allocation; code stubs them. No new player-facing rule.

## Package touch list

- `packages/sim/`
- `packages/fixtures/`
- `packages/content/` (read-only helpers only if needed; prefer sim-local filtering)

## Acceptance criteria

- [x] `generateItem` / carrier / boss offers roll affixes per registry budgets (not hardcoded `quickened`+`broken_gate` only)
- [x] Compatibility filter rejects tag/granted-card/incompatible/overdrawn-without-secondary cases
- [x] Curses only attach on Rare/Legendary at stated rates, and only when at least one non-curse affix upside remains
- [x] Legendary boss/signature path uses curated signatures with valid prefix+suffix
- [x] Named fixture `SIM-LOOT-01` (or equivalent) proves two different loot seeds produce different affix sets for the same vessel pool, and salvage stays affix-free
- [x] `pnpm test` and `pnpm check:boundaries` pass
- [x] Out of scope untouched

## Out of scope

- Wiring every affix modifier into combat resolution (separate change-spec)
- Reward UI compare / rarity chrome
- AI naming / lore generation
- New affix IDs beyond the registry pool

## Test plan

1. Unit/fixture: force `loot` stream draws to land Imbued prefix vs suffix, Rare prefix+suffix±curse, Legendary signature path.
2. Assert Salvaged gear has empty prefix/suffix/curse.
3. Assert incompatible pairs never co-occur on one instance.
4. `pnpm test`; optional UI smoke: win Roadside Trail and confirm offer names show varied prefix/suffix text.

kind: bug
