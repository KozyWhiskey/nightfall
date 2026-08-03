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
| Runtime role | Base-vessel item illustration; review fixture only until ART-04 inventory integration |
| Content source | [`vertical-slice-affix-pool.md`](../content/items/vertical-slice-affix-pool.md) |
| Prompt ID/version | `hewn_sword_candidate_chroma_v1` + `hewn_sword_tip_fix_v2`; full text in the [candidate record](../../art/source/candidates/items/hewn_sword/README.md) |
| Tool/model/date | Built-in image generation (model not surfaced), 2026-08-01 |
| References | [`hewn_sword_anchor_v2.png`](../../art/source/explorations/hewn_sword/hewn_sword_anchor_v2.png) |
| Original source | [`hewn_sword_candidate_chroma_v2.png`](../../art/source/candidates/items/hewn_sword/hewn_sword_candidate_chroma_v2.png) |
| Master | [`art/masters/items/hewn_sword.png`](../../art/masters/items/hewn_sword.png), transparent PNG, `1024 × 1024` |
| Runtime derivative | `packages/client/public/art/items/hewn_sword.webp`, lossless transparent WebP, `512 × 512` |
| Post-processing | Chroma removal, despill, soft matte, 18% brightness lift, 4% contrast lift, occupancy normalization, Lanczos downsample |
| Focal/orientation data | Diagonal lower-left grip to upper-right tip; 79.4% width and 83.8% height occupancy |
| QA | Transparent corners; alpha bbox `(117, 92)–(930, 950)`; checked at `128`, `64`, and `32` px in color and grayscale; live browser fixture passes with exact sizes, decoded `512 × 512` source, and no page overflow |
| Approval | `candidate`; not an approved master or inventory-integrated asset |

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
| Approval | `candidate`; registry-wired for in-context review, not yet an approved master |

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
| Standard enemies | `gloomfang_hound`, `shattered_husk`, `mire_imp`, `mist_chanter`, `gloom_spore` | 5 | Shattered Husk master `v1` approved and verified; Gloomfang Hound, Mire Imp, and Mist Chanter candidates `v1` technically passed; Gloom Spore uses an SVG placeholder |
| Boss | `lantern_smother` | 1 | Master `v1` approved, registry-wired, and verified |
| Boss entity | `smothering_shroud` | 1 | Master `v1` approved, separately registry-wired, and verified |

Total required combat standees: **9**.

Mara's earlier Aether Weaver exploration and target-size comparison remain archived under [`art/source/explorations/aether_weaver/`](../../art/source/explorations/aether_weaver/); the current production candidate is recorded above.

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
