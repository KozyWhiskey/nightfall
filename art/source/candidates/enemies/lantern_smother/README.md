# Lantern-Smother Production Candidate

**Date:** 2026-08-01
**Tool:** Built-in image generation; model identifier is not surfaced by the built-in tool
**Status:** Candidate v1; technical QA passed, reviewer approval pending

## Files

| File | Role |
|---|---|
| `lantern_smother_candidate_chroma_v1.png` | Immutable generated chroma source |
| `lantern_smother_candidate_alpha_v1.png` | Cleaned alpha extraction before contract framing |
| `lantern_smother_candidate_qa_v1.png` | Field-color, alpha, runtime-size, and grayscale review sheet |

Master: [`art/masters/enemies/lantern_smother.png`](../../../../masters/enemies/lantern_smother.png) — transparent `992 × 1152` PNG.

Runtime review derivative: [`packages/client/public/art/enemies/lantern_smother.webp`](../../../../../packages/client/public/art/enemies/lantern_smother.webp) — lossless transparent `496 × 576` WebP.

## Post-processing and QA record

- Separated the boss from the approved relationship study before production; the Smothering Shroud is delivered as its own candidate and runtime asset.
- Removed the generated green field with the installed `remove_chroma_key.py` helper using border auto-key, soft matte, thresholds `12/220`, and despill.
- Detected border key: `#03fa05`; extraction produced `756,905 / 1,573,539` transparent pixels and `8,059` partially transparent pixels.
- Cropped to alpha bounds and proportionally framed the boss on the required `992 × 1152` master without stretching.
- Final alpha bounds: `(60, 50)–(932, 1083)`; top safe area `4.34%`; side safe areas `6.05% / 6.05%`; ground line `94.01%`; all corner alpha values are `0`.
- Created the runtime derivative at `496 × 576` as lossless WebP (`200,572` bytes).
- Automated fringe scan found `235` muted green-dominant master pixels above alpha `8`; `32` exceed alpha `64`, with maximum alpha `153`. The runtime derivative has `118`, all at alpha `58` or lower. No visible green edge appears on either required field color or the checkerboard.
- Source-sheet review passed at `86 × 115`, `72 × 96`, and `32 × 38` on both required field colors and in grayscale. The broken civic lantern, enclosing arch, anchored base, and captive ember remain readable; source-level cage detail appropriately collapses into three major planes.
- Live `?artReview=anchors` review passed neutral, active, targetable, acting, downed, and linked treatments. Nine boss images decoded from the `496 × 576` WebP, all hostile presentations use the required horizontal mirror, and the page has no horizontal overflow.
- Only the client was started for this review. The fixture is presentation-only; a host-backed boss encounter was not claimed or required for this candidate gate.

## Integrity hashes

| File | SHA-256 |
|---|---|
| Chroma source | `3BB6A738E3E03427AF48B0B30CF97A5D61123B78047F62727B545027090DEBBF` |
| Alpha extraction | `8738C9279204655581871F86853FA67703DA0555368DF16DCB0E6D29A4350CE3` |
| Transparent PNG master | `BD04FF591B58625BAB946F9A78C396818D3A34BEB948B7171A200AB44E902359` |
| Runtime lossless WebP | `1D95663E819830470C1656685FF50AC81D14CE568AD469BE51C20569DD8922AB` |

## Exact prompt

```text
Use case: background-extraction
Asset type: NIGHTFALL production-candidate boss combat standee
Input image: Image 1 is the approved Lantern-Smother and Smothering Shroud relationship study. Preserve the Lantern-Smother's core identity and material language, but extract and re-render only the large Lantern-Smother boss. Do not include the smaller Shroud entity.
Primary request: Produce exactly one Lantern-Smother: a large, slow Gloom intelligence nesting around the broken physical structure of a fallen civic Way-lantern and feeding on the memory of its protective light. The Way-lantern must be the structural heart of the silhouette, not a prop held by a generic ghost.
Subject construction: simplify the fallen lantern into three dominant readable planes: a broad broken soot-black iron cage/base, a cracked ash lens chamber, and a restrained aged-copper brace/crown. Keep one tiny captive ember at the center as the brightest focal point. Dense purple-grey Gloom rises from and curves inward around this structure as a broad hood/arch with three or four heavy pressure folds. Suggest one nearly remembered warden's hand only through a single negative-space shape in the mist; no literal face or hand collage.
Production correction: reduce surface microdetail by roughly 35%. Remove repeated chains, tiny rivets, filigree, wire lattice, and loose fragments. Use two or three large value masses. Make the lantern aperture, enclosing arch, and broad anchored base unmistakable at 72x96 and recognizable at 32x38. Keep all Gloom folds connected to the main silhouette; no detached particles, wisps, or islands.
Style/medium: painterly dark-fantasy game illustration with broad authored brush planes, disciplined readable silhouette, twilight-gothic memory horror, and ashen relic-craft construction. Solemn and tactile, not photorealistic or glossy 3D.
Composition/framing: exactly one full silhouette, tall 31:36 combat-standee composition, canonically leaning/facing screen-right. Broad grounded base, rising asymmetrical hood, generous clear padding around every edge, no cropping, no dramatic foreshortening.
Scene/backdrop: perfectly flat solid #00ff00 chroma-key background for local removal. One uniform color with no gradient, texture, floor plane, vignette, atmospheric fog, shadow, reflection, or lighting variation. Do not use #00ff00 or similar green anywhere in the boss.
Lighting/mood: soft top-left key, cool twilight fill, tiny confined warm reflection from the captive ember. Gloom swallows selected edges without destroying the boss contour.
Color palette: soot-black iron, cracked ash crystal, aged copper, restrained #776c91 purple-grey Gloom, one confined #d99a4e ember core.
Constraints: exactly one boss; no separate Shroud, second creature, hero, wolf, weapon, scenery, floor, cast/contact shadow, text, UI, badge, frame, or watermark.
Avoid: generic hooded necromancer, robed humanoid, tentacle demon, giant eyeball, skull pile, screaming face, bright purple aura, excessive particles, detached smoke, ornate cage detail, pristine lantern, MMO spectacle, photorealism, glossy 3D, anime, pixel art, or chibi.
```
