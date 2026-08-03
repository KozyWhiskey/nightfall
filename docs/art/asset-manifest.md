# Build 1 Art Asset Manifest

**Status:** Active production inventory — approved masters and review candidates tracked below
**Last updated:** 2026-08-03
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
| `vanguard` | `heroes/vanguard` | Human construction, hero rendering, starter loadout | `candidate` — production candidate `v1`; technical QA passed, reviewer approval pending |
| `gloomfang_hound` | `enemies/gloomfang_hound` | Frayed-beast anatomy and Band-1 readability | `candidate` — production candidate `v1`; technical QA passed, reviewer approval pending |
| `lantern_smother` | `enemies/lantern_smother` | Boss scale, memory horror, Way-lantern relationship | `verified` — boss and separate Shroud masters `v1` approved 2026-08-02 |
| `hewn_sword` | `items/hewn_sword` | Salvaged base-vessel and bound-magic language | `candidate` — production candidate `v3`; contract review in progress |

The Lantern-Smother exploration must include a relationship study with `smothering_shroud`, but the Shroud remains a separately delivered runtime asset.

Pass-1 source files, exact prompts, and review notes live under [`art/source/explorations/`](../../art/source/explorations/README.md). No exploration is approved for runtime use.

**Direction review (2026-08-01):** The pass established and locked the shared visual language. That approval applied to direction only. Each Phase 1 anchor has since advanced through separate production cleanup and technical review into the candidates recorded below; none is an approved master until reviewer approval is recorded.

### Hewn Sword candidate v3

| Field | Record |
|---|---|
| Asset ID | `hewn_sword` |
| Runtime role | Base-vessel item illustration in Haven-held, equipped-slot, inspector, and review-fixture contexts |
| Content source | [`vertical-slice-affix-pool.md`](../content/items/vertical-slice-affix-pool.md) |
| Prompt ID/version | `hewn_sword_candidate_chroma_v1` + `hewn_sword_tip_fix_v2`; full text in the [candidate record](../../art/source/candidates/items/hewn_sword/README.md) |
| Tool/model/date | Built-in image generation (model not surfaced), 2026-08-01 |
| References | [`hewn_sword_anchor_v2.png`](../../art/source/explorations/hewn_sword/hewn_sword_anchor_v2.png) |
| Original source | [`hewn_sword_candidate_chroma_v2.png`](../../art/source/candidates/items/hewn_sword/hewn_sword_candidate_chroma_v2.png) |
| Master | [`art/masters/items/hewn_sword.png`](../../art/masters/items/hewn_sword.png), transparent PNG, `1024 × 1024` |
| Runtime derivative | `packages/client/public/art/items/hewn_sword.webp`, lossless transparent WebP, `512 × 512` |
| Post-processing | Chroma removal, despill, soft matte, 18% brightness lift, 4% contrast lift, occupancy normalization, Lanczos downsample |
| Focal/orientation data | Diagonal lower-left grip to upper-right tip; 79.4% width and 83.8% height occupancy |
| QA | Transparent corners; alpha bbox `(117, 92)–(930, 950)`; checked at `128`, `64`, and `32` px in color and grayscale; live browser fixture passes with exact sizes, decoded `512 × 512` source, and no page overflow; isolated inventory QA passes in Haven-held, equipped-slot, and inspector contexts with missing-art glyph fallback verified on Kite Shield |
| Approval | `candidate`; not an approved master or inventory-integrated asset |

### Gloomwood Spear candidate v2

| Field | Record |
|---|---|
| Asset ID | `gloomwood_spear` |
| Runtime role | Base-vessel item illustration in Haven-held, equipped-slot, inspector, and review-fixture contexts |
| Content source | [`vertical-slice-affix-pool.md`](../content/items/vertical-slice-affix-pool.md) |
| Prompt ID/version | `gloomwood_spear_candidate_chroma_v1` + `gloomwood_spear_readability_fix_v2`; full text in the [candidate record](../../art/source/candidates/items/gloomwood_spear/README.md) |
| Tool/model/date | Built-in image generation (model not surfaced), 2026-08-03 |
| References | No image references; derived from accepted content and the visual style/technical contracts |
| Original source | [`gloomwood_spear_candidate_chroma_v2.png`](../../art/source/candidates/items/gloomwood_spear/gloomwood_spear_candidate_chroma_v2.png) |
| Master | [`art/masters/items/gloomwood_spear.png`](../../art/masters/items/gloomwood_spear.png), transparent PNG, `1024 × 1024` |
| Runtime derivative | `packages/client/public/art/items/gloomwood_spear.webp`, lossless transparent WebP, `512 × 512` |
| Post-processing | Chroma removal, despill, alpha-bounds crop, occupancy normalization, Lanczos downsample |
| Focal/orientation data | Diagonal lower-left butt to upper-right spear tip; 81.3% width and 83.8% height occupancy |
| QA | Transparent corners; alpha bbox `(95, 83)–(928, 941)`; no green-dominant visible pixels; checked at `128`, `64`, and `32` px in color and grayscale; registry-wired to the deterministic review fixture |
| Approval | `verified`; master v2 approved by reviewer 2026-08-03, registry-wired and fixture-verified |

### Aether Rod master v1

| Field | Record |
|---|---|
| Asset ID | `aether_rod` |
| Runtime role | Base-vessel item illustration in Haven-held, equipped-slot, inspector, and review-fixture contexts |
| Content source | [`vertical-slice-affix-pool.md`](../content/items/vertical-slice-affix-pool.md) |
| Prompt ID/version | `aether_rod_candidate_chroma_v1`; full text in the [candidate record](../../art/source/candidates/items/aether_rod/README.md) |
| Tool/model/date | Built-in image generation (model not surfaced), 2026-08-03 |
| References | No image references; derived from accepted content and the visual style/technical contracts |
| Original source | [`aether_rod_candidate_chroma_v1.png`](../../art/source/candidates/items/aether_rod/aether_rod_candidate_chroma_v1.png) |
| Master | [`art/masters/items/aether_rod.png`](../../art/masters/items/aether_rod.png), transparent PNG, `1024 × 1024` |
| Runtime derivative | `packages/client/public/art/items/aether_rod.webp`, lossless transparent WebP, `512 × 512` |
| Post-processing | Chroma removal, despill, alpha-bounds crop, occupancy normalization, Lanczos downsample |
| Focal/orientation data | Diagonal lower-left grip to upper-right containment ring; 77.0% width and 83.8% height occupancy |
| QA | Transparent corners; alpha bbox `(118, 83)–(906, 941)`; no green-dominant visible pixels; checked at `128`, `64`, and `32` px in color and grayscale |
| Approval | `approved-master`; master v1 approved by reviewer 2026-08-03; registry wiring and fixture verification pending commit |

### Cinder Scepter master v1

| Field | Record |
|---|---|
| Asset ID | `cinder_scepter` |
| Runtime role | Base-vessel item illustration in Haven-held, equipped-slot, inspector, and review-fixture contexts |
| Content source | [`vertical-slice-affix-pool.md`](../content/items/vertical-slice-affix-pool.md) |
| Prompt ID/version | `cinder_scepter_candidate_chroma_v1`; full text in the [candidate record](../../art/source/candidates/items/cinder_scepter/README.md) |
| Tool/model/date | Built-in image generation (model not surfaced), 2026-08-03 |
| References | No image references; derived from accepted content and the visual style/technical contracts |
| Original source | [`cinder_scepter_candidate_chroma_v1.png`](../../art/source/candidates/items/cinder_scepter/cinder_scepter_candidate_chroma_v1.png) |
| Master | [`art/masters/items/cinder_scepter.png`](../../art/masters/items/cinder_scepter.png), transparent PNG, `1024 × 1024` |
| Runtime derivative | `packages/client/public/art/items/cinder_scepter.webp`, lossless transparent WebP, `512 × 512` |
| Post-processing | Chroma removal, despill, alpha-bounds crop, occupancy normalization, Lanczos downsample |
| Focal/orientation data | Diagonal lower-left pommel to upper-right lantern cage; 62.8% width and 83.8% height occupancy |
| QA | Transparent corners; alpha bbox `(190, 83)–(833, 941)`; no green-dominant visible pixels; checked at `128`, `64`, and `32` px in color and grayscale |
| Approval | `approved-master`; master v1 approved by reviewer 2026-08-03; registry wiring and fixture verification pending commit |

### Kite Shield master v1

| Field | Record |
|---|---|
| Asset ID | `kite_shield` |
| Runtime role | Base-vessel item illustration in Haven-held, equipped-slot, inspector, and review-fixture contexts |
| Content source | [`vertical-slice-affix-pool.md`](../content/items/vertical-slice-affix-pool.md) |
| Prompt ID/version | `kite_shield_candidate_chroma_v1`; full text in the [candidate record](../../art/source/candidates/items/kite_shield/README.md) |
| Tool/model/date | Built-in image generation (model not surfaced), 2026-08-03 |
| References | No image references; derived from accepted content and the visual style/technical contracts |
| Original source | [`kite_shield_candidate_chroma_v1.png`](../../art/source/candidates/items/kite_shield/kite_shield_candidate_chroma_v1.png) |
| Master | [`art/masters/items/kite_shield.png`](../../art/masters/items/kite_shield.png), transparent PNG, `1024 × 1024` |
| Runtime derivative | `packages/client/public/art/items/kite_shield.webp`, lossless transparent WebP, `512 × 512` |
| Post-processing | Chroma removal, despill, alpha-bounds crop, occupancy normalization, Lanczos downsample |
| Focal/orientation data | Upright kite silhouette with a slight tilt; 54.9% width and 83.8% height occupancy |
| QA | Transparent corners; alpha bbox `(231, 83)–(793, 941)`; no green-dominant visible pixels; checked at `128`, `64`, and `32` px |
| Approval | `approved-master`; master v1 approved by reviewer 2026-08-03; registry wiring and fixture verification pending commit |

### Way-lantern Buckler master v1

| Field | Record |
|---|---|
| Asset ID | `way_lantern_buckler` |
| Runtime role | Base-vessel item illustration |
| Content source | [`vertical-slice-affix-pool.md`](../content/items/vertical-slice-affix-pool.md) |
| Prompt ID/version | `way_lantern_buckler_candidate_chroma_v1`; full text in the [candidate record](../../art/source/candidates/items/way_lantern_buckler/README.md) |
| Tool/model/date | Built-in image generation (model not surfaced), 2026-08-03 |
| References | No image references |
| Original source | [`way_lantern_buckler_candidate_chroma_v1.png`](../../art/source/candidates/items/way_lantern_buckler/way_lantern_buckler_candidate_chroma_v1.png) |
| Master | [`art/masters/items/way_lantern_buckler.png`](../../art/masters/items/way_lantern_buckler.png), transparent PNG, `1024 × 1024` |
| Runtime derivative | `packages/client/public/art/items/way_lantern_buckler.webp`, lossless transparent WebP, `512 × 512` |
| Post-processing | Chroma removal, despill, alpha-bounds crop, occupancy normalization, Lanczos downsample |
| Focal/orientation data | Round buckler with a contained central Way-lantern aperture; 76.5% width and 83.8% height occupancy |
| QA | Transparent corners; alpha bbox `(120, 83)–(903, 941)`; checked at `128`, `64`, and `32` px |
| Approval | `approved-master`; master v1 approved by reviewer 2026-08-03; registry wiring and fixture verification pending commit |

### Archivist’s Focus master v1

| Field | Record |
|---|---|
| Asset ID | `archivists_focus` |
| Runtime role | Base-vessel item illustration |
| Content source | [`vertical-slice-affix-pool.md`](../content/items/vertical-slice-affix-pool.md) |
| Prompt ID/version | `archivists_focus_candidate_chroma_v1`; full text in the [candidate record](../../art/source/candidates/items/archivists_focus/README.md) |
| Tool/model/date | Built-in image generation (model not surfaced), 2026-08-03 |
| Master | [`art/masters/items/archivists_focus.png`](../../art/masters/items/archivists_focus.png), transparent PNG, `1024 × 1024` |
| Runtime derivative | `packages/client/public/art/items/archivists_focus.webp`, lossless transparent WebP, `512 × 512` |
| QA | Transparent corners; alpha bbox `(228, 83)–(795, 941)`; checked at `128`, `64`, and `32` px |
| Approval | `approved-master`; master v1 approved by reviewer 2026-08-03 |

### Cracked Way Lens master v1

| Field | Record |
|---|---|
| Asset ID | `cracked_way_lens` |
| Runtime role | Base-vessel relic illustration |
| Content source | [`vertical-slice-affix-pool.md`](../content/items/vertical-slice-affix-pool.md) |
| Tool/model/date | Built-in image generation (model not surfaced), 2026-08-03 |
| Master | [`art/masters/items/cracked_way_lens.png`](../../art/masters/items/cracked_way_lens.png), transparent PNG, `1024 × 1024` |
| Runtime derivative | `packages/client/public/art/items/cracked_way_lens.webp`, lossless transparent WebP, `512 × 512` |
| QA | Transparent corners; alpha bbox `(206, 83)–(817, 941)`; checked at `128`, `64`, and `32` px |
| Approval | `approved-master`; master v1 approved by reviewer 2026-08-03 |

### Pilgrim’s Knot master v1

| Field | Record |
|---|---|
| Asset ID | `pilgrims_knot` |
| Runtime role | Base-vessel relic illustration |
| Master | [`art/masters/items/pilgrims_knot.png`](../../art/masters/items/pilgrims_knot.png), transparent PNG, `1024 × 1024` |
| Runtime derivative | `packages/client/public/art/items/pilgrims_knot.webp`, lossless transparent WebP, `512 × 512` |
| QA | Transparent corners; alpha bbox `(207, 83)–(817, 941)` |
| Approval | `approved-master`; master v1 approved by reviewer 2026-08-03 |

### Vanguard candidate v1

| Field | Record |
|---|---|
| Asset ID | `vanguard` |
| Runtime role | Full-body hero combat standee and current initiative source |
| Content source | [`vanguard.md`](../content/classes/vanguard.md) and [`vertical-slice-starter-kits.md`](../content/classes/vertical-slice-starter-kits.md) |
| Prompt ID/version | `vanguard_candidate_chroma_v1`; full text in the [candidate record](../../art/source/candidates/heroes/vanguard/README.md) |
| Tool/model/date | Built-in image generation (model not surfaced), 2026-08-01 |
| References | [`vanguard_anchor_v2.png`](../../art/source/explorations/vanguard/vanguard_anchor_v2.png) and [`hewn_sword.png`](../../art/masters/items/hewn_sword.png) |
| Original source | [`vanguard_candidate_chroma_v1.png`](../../art/source/candidates/heroes/vanguard/vanguard_candidate_chroma_v1.png) |
| Master | [`art/masters/heroes/vanguard.png`](../../art/masters/heroes/vanguard.png), transparent PNG, `992 × 1152` |
| Runtime derivative | `packages/client/public/art/heroes/vanguard.webp`, lossless transparent WebP, `496 × 576` |
| Post-processing | Chroma removal, despill, soft matte, alpha-bounds crop, proportional resize, exact master framing, Lanczos downsample |
| Focal/orientation data | Canonically screen-right; alpha bbox `(123, 50)–(868, 1083)`; ground line `94.01%` |
| QA | Transparent corners; 12.4%/12.5% side safe areas and 4.34% top safe area; no green-dominant visible pixels; source-sheet and live neutral/active/targetable/acting/downed/linked states pass; decoded `496 × 576` source; no review-page overflow |
| Approval | `candidate`; registry-wired for in-context review, not yet an approved master |

### Aether Weaver candidate v1

| Field | Record |
|---|---|
| Asset ID | `aether_weaver` |
| Runtime role | Full-body hero combat standee and current initiative source |
| Content source | [`aether-weaver.md`](../content/classes/aether-weaver.md) and [`vertical-slice-starter-kits.md`](../content/classes/vertical-slice-starter-kits.md) |
| Prompt ID/version | `aether_weaver_candidate_chroma_v1`; full text in the [candidate record](../../art/source/candidates/heroes/aether_weaver/README.md) |
| Tool/model/date | Built-in image generation (model not surfaced), 2026-08-01 |
| References | [`aether_weaver_anchor_v2.png`](../../art/source/explorations/aether_weaver/aether_weaver_anchor_v2.png) and [`vanguard.png`](../../art/masters/heroes/vanguard.png) |
| Original source | [`aether_weaver_candidate_chroma_v1.png`](../../art/source/candidates/heroes/aether_weaver/aether_weaver_candidate_chroma_v1.png) |
| Master | [`art/masters/heroes/aether_weaver.png`](../../art/masters/heroes/aether_weaver.png), transparent PNG, `992 × 1152` |
| Runtime derivative | `packages/client/public/art/heroes/aether_weaver.webp`, lossless transparent WebP, `496 × 576` |
| Post-processing | Chroma removal, despill, soft matte, alpha-bounds crop, proportional resize, exact master framing, Lanczos downsample |
| Focal/orientation data | Canonically screen-right; alpha bbox `(165, 50)–(827, 1083)`; ground line `94.01%` |
| QA | Transparent corners; 16.63% side safe areas and 4.34% top safe area; no visible matte contamination; source-sheet and live neutral/active/targetable/acting/downed/linked states pass; decoded `496 × 576` source; no review-page overflow |
| Approval | `candidate`; registry-wired for in-context review, not yet an approved master |

### Gloomfang Hound candidate v1

| Field | Record |
|---|---|
| Asset ID | `gloomfang_hound` |
| Runtime role | Band-1 enemy combat standee and current initiative source |
| Content source | [`band-1-frontier.md`](../content/enemies/band-1-frontier.md) |
| Prompt ID/version | `gloomfang_hound_candidate_chroma_v1`; full text in the [candidate record](../../art/source/candidates/enemies/gloomfang_hound/README.md) |
| Tool/model/date | Built-in image generation (model not surfaced), 2026-08-01 |
| References | [`gloomfang_hound_anchor_v1.png`](../../art/source/explorations/gloomfang_hound/gloomfang_hound_anchor_v1.png) |
| Original source | [`gloomfang_hound_candidate_chroma_v1.png`](../../art/source/candidates/enemies/gloomfang_hound/gloomfang_hound_candidate_chroma_v1.png) |
| Master | [`art/masters/enemies/gloomfang_hound.png`](../../art/masters/enemies/gloomfang_hound.png), transparent PNG, `992 × 1152` |
| Runtime derivative | `packages/client/public/art/enemies/gloomfang_hound.webp`, lossless transparent WebP, `496 × 576` |
| Post-processing | Chroma removal, despill, soft matte, alpha-bounds crop, proportional resize, exact width-limited master framing, Lanczos downsample |
| Focal/orientation data | Canonically screen-right; alpha bbox `(60, 442)–(932, 1083)`; ground line `94.01%`; hostile presentation mirrors left in the client |
| QA | Transparent corners; 6.05% side safe areas; source-sheet checks on both field colors, checker, runtime sizes, and grayscale passed; live hostile orientation plus neutral/active/targetable/acting/downed/linked states passed; decoded `496 × 576` source; no review-page overflow |
| Approval | `candidate`; registry-wired for in-context review, not yet an approved master |

### Shattered Husk candidate v1

| Field | Record |
|---|---|
| Asset ID | `shattered_husk` |
| Runtime role | Band-1 tank enemy combat standee and current initiative source |
| Content source | [`band-1-frontier.md`](../content/enemies/band-1-frontier.md) |
| Prompt ID/version | `shattered_husk_candidate_chroma_v1`; full text in the [candidate record](../../art/source/candidates/enemies/shattered_husk/README.md) |
| Tool/model/date | Built-in image generation (model not surfaced), 2026-08-02 |
| References | [`vanguard.png`](../../art/masters/heroes/vanguard.png) and [`gloomfang_hound.png`](../../art/masters/enemies/gloomfang_hound.png) as style/material references only |
| Original source | [`shattered_husk_candidate_chroma_v1.png`](../../art/source/candidates/enemies/shattered_husk/shattered_husk_candidate_chroma_v1.png) |
| Master | [`art/masters/enemies/shattered_husk.png`](../../art/masters/enemies/shattered_husk.png), transparent PNG, `992 × 1152` |
| Runtime derivative | `packages/client/public/art/enemies/shattered_husk.webp`, lossless transparent WebP, `496 × 576` |
| Post-processing | Chroma removal, despill, soft matte, alpha-bounds crop, proportional resize, exact master framing, Lanczos downsample |
| Focal/orientation data | Canonically screen-right; alpha bbox `(149, 50)–(843, 1083)`; ground line `94.01%`; hostile presentation mirrors left in the client |
| QA | Transparent corners; 15.02% side safe areas and 4.34% top safe area; source-sheet and live state checks passed; bowed head, pack wedge, guard arm, and dragging hand survive initiative size; decoded `496 × 576` source; no review-page overflow |
| Approval | `verified`; approved by reviewer 2026-08-03, registry-wired and verified in context |

### Mire Imp candidate v1

| Field | Record |
|---|---|
| Asset ID | `mire_imp` |
| Runtime role | Band-1 disruptor enemy combat standee and current initiative source |
| Content source | [`band-1-frontier.md`](../content/enemies/band-1-frontier.md) |
| Prompt ID/version | `mire_imp_candidate_chroma_v1`; full text in the [candidate record](../../art/source/candidates/enemies/mire_imp/README.md) |
| Tool/model/date | Built-in image generation (model not surfaced), 2026-08-03 |
| References | [`gloomfang_hound.png`](../../art/masters/enemies/gloomfang_hound.png) and [`smothering_shroud.png`](../../art/masters/entities/smothering_shroud.png) as rendering/shape references only |
| Original source | [`mire_imp_candidate_chroma_v1.png`](../../art/source/candidates/enemies/mire_imp/mire_imp_candidate_chroma_v1.png) |
| Master | [`art/masters/enemies/mire_imp.png`](../../art/masters/enemies/mire_imp.png), transparent PNG, `992 × 1152` |
| Runtime derivative | `packages/client/public/art/enemies/mire_imp.webp`, lossless transparent WebP, `496 × 576` |
| Post-processing | Chroma removal, despill, soft matte, alpha-bounds crop, proportional resize, deliberately reduced small-creature framing, Lanczos downsample |
| Focal/orientation data | Canonically screen-right; alpha bbox `(114, 303)–(877, 1083)`; ground line `93.92%`; hostile presentation mirrors left in the client |
| QA | Transparent corners; 11.49% / 11.59% side safe areas and 26.30% top safe area; source-sheet and live state checks passed; crouch, voice aperture, shoulder fin, and casting hand survive initiative size; decoded `496 × 576` source; no review-page overflow |
| Approval | `candidate`; registry-wired for in-context review, not yet an approved master |

### Mist Chanter candidate v1

| Field | Record |
|---|---|
| Asset ID | `mist_chanter` |
| Runtime role | Band-1 support enemy combat standee and current initiative source |
| Content source | [`band-1-frontier.md`](../content/enemies/band-1-frontier.md) |
| Prompt ID/version | `mist_chanter_candidate_chroma_v1`; initial and accepted revision prompts in the [candidate record](../../art/source/candidates/enemies/mist_chanter/README.md) |
| Tool/model/date | Built-in image generation (model not surfaced), 2026-08-03 |
| References | [`shattered_husk.png`](../../art/masters/enemies/shattered_husk.png) and [`smothering_shroud.png`](../../art/masters/entities/smothering_shroud.png) as rendering/material and shape references only |
| Original source | [`mist_chanter_candidate_chroma_v1.png`](../../art/source/candidates/enemies/mist_chanter/mist_chanter_candidate_chroma_v1.png) |
| Master | [`art/masters/enemies/mist_chanter.png`](../../art/masters/enemies/mist_chanter.png), transparent PNG, `992 × 1152` |
| Runtime derivative | `packages/client/public/art/enemies/mist_chanter.webp`, lossless transparent WebP, `496 × 576` |
| Post-processing | Targeted face/throat and costume-discipline revision; chroma removal, despill, soft matte, alpha-bounds crop, proportional resize, exact master framing, Lanczos downsample |
| Focal/orientation data | Canonically screen-right; alpha bbox `(184, 50)–(807, 1083)`; ground line `93.92%`; hostile presentation mirrors left in the client |
| QA | Transparent corners; 18.55% / 18.65% side safe areas and 4.34% top safe area; source-sheet and live state checks passed; conducting stance, sealed voice-bellows, hands, yoke, and name-tabs survive their intended sizes; decoded `496 × 576` source; no review-page overflow |
| Approval | `verified`; approved by reviewer 2026-08-03, registry-wired and verified in context |

### Gloom Spore candidate v1

| Field | Record |
|---|---|
| Asset ID | `gloom_spore` |
| Runtime role | Band-1 exploder enemy combat standee and current initiative source |
| Content source | [`band-1-frontier.md`](../content/enemies/band-1-frontier.md) |
| Prompt ID/version | `gloom_spore_candidate_chroma_v1`; full text in the [candidate record](../../art/source/candidates/enemies/gloom_spore/README.md) |
| Tool/model/date | Built-in image generation (model not surfaced), 2026-08-03 |
| References | [`mire_imp.png`](../../art/masters/enemies/mire_imp.png) and [`gloomfang_hound.png`](../../art/masters/enemies/gloomfang_hound.png) as fear-parasite rendering/material and restrained corruption references only |
| Original source | [`gloom_spore_candidate_chroma_v1.png`](../../art/source/candidates/enemies/gloom_spore/gloom_spore_candidate_chroma_v1.png) |
| Master | [`art/masters/enemies/gloom_spore.png`](../../art/masters/enemies/gloom_spore.png), transparent PNG, `992 × 1152` |
| Runtime derivative | `packages/client/public/art/enemies/gloom_spore.webp`, lossless transparent WebP, `496 × 576` |
| Post-processing | Chroma removal, despill, soft matte, alpha-bounds crop, proportional resize, deliberately reduced small-creature framing, Lanczos downsample |
| Focal/orientation data | Canonically screen-right; alpha bbox `(191, 383)–(800, 1083)`; ground line `93.92%`; hostile presentation mirrors left in the client |
| QA | Transparent corners; 19.25% / 19.35% side safe areas and 33.25% top safe area; source-sheet and live state checks passed; swollen orb, three-scar cadence, marker shard, vent, and root-star base survive their intended sizes; decoded `496 × 576` source; no review-page overflow |
| Approval | `verified`; approved by reviewer 2026-08-03, registry-wired and verified in context |

### Lantern-Smother candidate v1

| Field | Record |
|---|---|
| Asset ID | `lantern_smother` |
| Runtime role | Boss combat standee and current initiative source |
| Content source | [`the-unlit-road.md`](../content/expeditions/the-unlit-road.md) |
| Prompt ID/version | `lantern_smother_candidate_chroma_v1`; full text in the [candidate record](../../art/source/candidates/enemies/lantern_smother/README.md) |
| Tool/model/date | Built-in image generation (model not surfaced), 2026-08-01 |
| References | [`lantern_smother_shroud_study_v1.png`](../../art/source/explorations/lantern_smother/lantern_smother_shroud_study_v1.png) |
| Original source | [`lantern_smother_candidate_chroma_v1.png`](../../art/source/candidates/enemies/lantern_smother/lantern_smother_candidate_chroma_v1.png) |
| Master | [`art/masters/enemies/lantern_smother.png`](../../art/masters/enemies/lantern_smother.png), transparent PNG, `992 × 1152` |
| Runtime derivative | `packages/client/public/art/enemies/lantern_smother.webp`, lossless transparent WebP, `496 × 576` |
| Post-processing | Boss isolated from relationship study; chroma removal, despill, soft matte, alpha-bounds crop, proportional resize, exact master framing, Lanczos downsample |
| Focal/orientation data | Canonically screen-right; alpha bbox `(60, 50)–(932, 1083)`; ground line `94.01%`; hostile presentation mirrors left in the client |
| QA | Transparent corners; 6.05% side safe areas and 4.34% top safe area; source-sheet and live state checks passed; captive ember and enclosing lantern arch survive initiative size; decoded `496 × 576` source; no review-page overflow |
| Approval | `verified`; approved by reviewer 2026-08-02, registry-wired separately from the Shroud |

### Smothering Shroud candidate v1

| Field | Record |
|---|---|
| Asset ID | `smothering_shroud` |
| Runtime role | Separate boss-mechanic entity combat standee and initiative source |
| Content source | [`the-unlit-road.md`](../content/expeditions/the-unlit-road.md) |
| Prompt ID/version | `smothering_shroud_candidate_chroma_v1`; full text in the [candidate record](../../art/source/candidates/entities/smothering_shroud/README.md) |
| Tool/model/date | Built-in image generation (model not surfaced), 2026-08-01 |
| References | [`lantern_smother_shroud_study_v1.png`](../../art/source/explorations/lantern_smother/lantern_smother_shroud_study_v1.png) |
| Original source | [`smothering_shroud_candidate_chroma_v1.png`](../../art/source/candidates/entities/smothering_shroud/smothering_shroud_candidate_chroma_v1.png) |
| Master | [`art/masters/entities/smothering_shroud.png`](../../art/masters/entities/smothering_shroud.png), transparent PNG, `992 × 1152` |
| Runtime derivative | `packages/client/public/art/entities/smothering_shroud.webp`, lossless transparent WebP, `496 × 576` |
| Post-processing | Entity isolated and redesigned from relationship study; chroma removal, despill, soft matte, alpha-bounds crop, proportional resize, exact master framing, Lanczos downsample |
| Focal/orientation data | Canonically screen-right; alpha bbox `(232, 50)–(760, 1083)`; ground line `94.01%`; hostile presentation mirrors left in the client |
| QA | Transparent corners; 23.39% side safe areas and 4.34% top safe area; source-sheet and live state checks passed; pinched ring and trapped spark remain distinct from the boss; decoded `496 × 576` source; no review-page overflow |
| Approval | `verified`; approved by reviewer 2026-08-02, registry-wired separately from the boss |

## Phase 2 combat standees

| Group | IDs | Count | Current state |
|---|---|---:|---|
| Heroes | `vanguard`, `aether_weaver` | 2 | Both hero candidate `v1` derivatives registry-wired and technically passed; reviewer approval pending; SVG fallbacks retained |
| Standard enemies | `gloomfang_hound`, `shattered_husk`, `mire_imp`, `mist_chanter`, `gloom_spore` | 5 | Shattered Husk, Mist Chanter, and Gloom Spore masters `v1` approved and verified; Gloomfang Hound and Mire Imp candidates `v1` technically passed; all five runtime standees are registry-wired |
| Boss | `lantern_smother` | 1 | Master `v1` approved, registry-wired, and verified |
| Boss entity | `smothering_shroud` | 1 | Master `v1` approved, separately registry-wired, and verified |

Total required combat standees: **9**.

The [Band-1 enemy lineup audit](band-1-lineup-audit.md) passed on 2026-08-03 with no blocking repaint. All five standard-enemy full standees remain recognizable at initiative size, so Build 1 does not require dedicated enemy bust crops.

Mara's earlier Aether Weaver exploration and target-size comparison remain archived under [`art/source/explorations/aether_weaver/`](../../art/source/explorations/aether_weaver/); the current production candidate is recorded above.

## Phase 3 base-vessel illustrations

| Slot | IDs | Count | Integration state |
|---|---|---:|---|
| Main hand | `hewn_sword`, `gloomwood_spear`, `aether_rod`, `cinder_scepter` | 4 | ID-keyed resolver active; Hewn Sword candidate plus Gloomwood Spear, Aether Rod, and Cinder Scepter approved masters wired |
| Offhand | `kite_shield`, `way_lantern_buckler`, `archivists_focus` | 3 | ID-keyed resolver active; all three approved masters wired |
| Relic | `cracked_way_lens`, `pilgrims_knot`, `name_thread_charm` | 3 | ID-keyed resolver active; Cracked Way Lens approved master wired; other vessels use glyph fallback |
| Head | `emberglass_cowl` | 1 | ID-keyed resolver active; glyph fallback until runtime art exists |
| Body | `wayfarers_coat` | 1 | ID-keyed resolver active; glyph fallback until runtime art exists |
| Gloves | `ironweave_gloves` | 1 | ID-keyed resolver active; glyph fallback until runtime art exists |

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
