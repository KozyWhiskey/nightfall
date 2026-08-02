# Build 1 Art Asset Manifest

**Status:** Active production inventory — no generated assets approved  
**Last updated:** 2026-08-01  
**Related:** [Build 1 Content Registry](../content/vertical-slice-content-registry.md), [Technical Asset Contract](technical-asset-contract.md)

## Status vocabulary

`planned` / `placeholder` → `exploration` → `candidate` → `approved-master` → `integrated` → `verified`

- **Planned:** Required asset with no current runtime representation.
- **Placeholder:** Current CSS/SVG representation; not an approved production look.
- **Exploration:** Directional work; cannot ship as a production asset.
- **Candidate:** Cleaned asset awaiting contract review.
- **Approved master:** Accepted lossless source.
- **Integrated:** Runtime derivative is wired to the client.
- **Verified:** Passed in-context, orientation, responsive-size, and fallback checks.

## Production record template

Create one record per candidate or approved asset:

| Field | Required value |
|---|---|
| Asset ID | Stable content/presentation ID |
| Runtime role | Standee, timeline portrait, item, glyph, VFX, atmosphere |
| Content source | Canonical documentation link |
| Prompt ID/version | Full resolved prompt in the prompt archive |
| Tool/model/date | Generator or authoring tool provenance |
| References | Exact approved images used, if any |
| Original source | Immutable source path |
| Master | Cleaned lossless path and dimensions |
| Runtime derivative | Public path, format, dimensions, and size |
| Post-processing | Crop, alpha cleanup, paintover, color adjustment, downsample |
| Focal/orientation data | Canonical direction and optional crop metadata |
| QA | Required size, grayscale, alpha, background, and orientation results |
| Approval | Status, reviewer, date, and rejection notes |

Exact prompts are necessary but not sufficient for reproduction. References, cleanup, and derivative settings are part of the asset.

## Phase 1 anchors

| Asset ID | Runtime path stem | Purpose | Status |
|---|---|---|---|
| `vanguard` | `heroes/vanguard` | Human construction, hero rendering, starter loadout | `exploration` — prefer `v2` for comparison |
| `gloomfang_hound` | `enemies/gloomfang_hound` | Frayed-beast anatomy and Band-1 readability | `exploration` — `v1` |
| `lantern_smother` | `enemies/lantern_smother` | Boss scale, memory horror, Way-lantern relationship | `exploration` — relationship study `v1` |
| `hewn_sword` | `items/hewn_sword` | Salvaged base-vessel and bound-magic language | `exploration` — prefer `v2` for comparison |

The Lantern-Smother exploration must include a relationship study with `smothering_shroud`, but the Shroud remains a separately delivered runtime asset.

Pass-1 source files, exact prompts, and review notes live under [`art/source/explorations/`](../../art/source/explorations/README.md). No exploration is approved for runtime use.

**Direction review (2026-08-01):** The pass established and locked the shared visual language. This approval applies to the direction only; every file above remains an exploration pending cleanup, technical delivery, and individual runtime review.

## Phase 2 combat standees

| Group | IDs | Count | Current state |
|---|---|---:|---|
| Heroes | `vanguard`, `aether_weaver` | 2 | SVG placeholders |
| Standard enemies | `gloomfang_hound`, `shattered_husk`, `mire_imp`, `mist_chanter`, `gloom_spore` | 5 | SVG placeholders |
| Boss | `lantern_smother` | 1 | SVG placeholder |
| Boss entity | `smothering_shroud` | 1 | SVG placeholder |

Total required combat standees: **9**.

## Phase 3 base-vessel illustrations

| Slot | IDs | Count | Integration state |
|---|---|---:|---|
| Main hand | `hewn_sword`, `gloomwood_spear`, `aether_rod`, `cinder_scepter` | 4 | No item-art resolver |
| Offhand | `kite_shield`, `way_lantern_buckler`, `archivists_focus` | 3 | No item-art resolver |
| Relic | `cracked_way_lens`, `pilgrims_knot`, `name_thread_charm` | 3 | No item-art resolver |
| Head | `emberglass_cowl` | 1 | No item-art resolver |
| Body | `wayfarers_coat` | 1 | No item-art resolver |
| Gloves | `ironweave_gloves` | 1 | No item-art resolver |

Total accepted Build 1 base vessels: **13**. Legs and Feet are valid empty slots and have no Build 1 vessel art.

Rarity variants are not 52 separate required paintings. Base-vessel recognition comes first; UI treatment and restrained overlays carry most procedural variation.

## UI glyphs

| IDs | Format | State | Direction |
|---|---|---|---|
| `attack`, `defend`, `buff`, `special` | SVG | Placeholder pack integrated | Refine by hand after standee anchors; do not generate as raster art |

## Limited layer proof

| Proof asset | Status | Gate |
|---|---|---|
| `vanguard_base` | Not started | Begin only after core standees are approved |
| `hewn_sword` main-hand overlay | Not started | Exact shared pose/canvas anchors |
| `gloomwood_spear` main-hand overlay | Not started | Must swap without anatomy repaint |
| `kite_shield` offhand overlay | Not started | Must preserve silhouette and hand attachment |

No armor, relic, rarity, or Aether Weaver layers are authorized until this proof passes.

## Deferred production

- Core combat VFX and status feedback: after playback timing specification.
- Haven/map atmosphere: after combat anchor lock; one Haven plate may precede broad VFX production.
- Dedicated timeline busts: only if the anchor standee test fails at timeline size.
- Legendary signature illustrations: after base-vessel integration and loot UI validation.
