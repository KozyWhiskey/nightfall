# Smothering Shroud Production Candidate

**Date:** 2026-08-01
**Tool:** Built-in image generation; model identifier is not surfaced by the built-in tool
**Status:** Candidate v1; technical QA passed, reviewer approval pending

## Files

| File | Role |
|---|---|
| `smothering_shroud_candidate_chroma_v1.png` | Immutable generated chroma source |
| `smothering_shroud_candidate_alpha_v1.png` | Cleaned alpha extraction before contract framing |
| `smothering_shroud_candidate_qa_v1.png` | Field-color, alpha, runtime-size, and grayscale review sheet |

Master: [`art/masters/entities/smothering_shroud.png`](../../../../masters/entities/smothering_shroud.png) — transparent `992 × 1152` PNG.

Runtime review derivative: [`packages/client/public/art/entities/smothering_shroud.webp`](../../../../../packages/client/public/art/entities/smothering_shroud.webp) — lossless transparent `496 × 576` WebP.

## Post-processing and QA record

- Delivered separately from the Lantern-Smother boss. The sharp pinched ring, inward strands, lens fragment, and trapped spark communicate a forming cancellation target rather than a smaller boss.
- Removed the generated green field with the installed `remove_chroma_key.py` helper using border auto-key, soft matte, thresholds `12/220`, and despill.
- Detected border key: `#06fa0b`; extraction produced `1,176,201 / 1,572,750` transparent pixels and `6,762` partially transparent pixels.
- Cropped to alpha bounds and proportionally framed the entity on the required `992 × 1152` master without stretching.
- Final alpha bounds: `(232, 50)–(760, 1083)`; top safe area `4.34%`; side safe areas `23.39% / 23.39%`; ground line `94.01%`; all corner alpha values are `0`.
- Created the runtime derivative at `496 × 576` as lossless WebP (`121,898` bytes).
- Automated fringe scan found `457` muted green-dominant master pixels above alpha `8`; `69` exceed alpha `64`, with maximum alpha `185`. The runtime derivative has `234`, only one above alpha `64` at alpha `66`. No visible green edge appears on either required field color or the checkerboard.
- Source-sheet review passed at `86 × 115`, `72 × 96`, and `32 × 38` on both required field colors and in grayscale. The pinched silhouette and trapped spark remain distinct from the boss; fine lens construction appropriately recedes at initiative size.
- Live `?artReview=anchors` review passed neutral, active, targetable, acting, downed, and linked treatments. Nine entity images decoded from the `496 × 576` WebP, all hostile presentations use the required horizontal mirror, and the page has no horizontal overflow.
- Only the client was started for this review. The fixture is presentation-only; a host-backed boss encounter was not claimed or required for this candidate gate.

## Integrity hashes

| File | SHA-256 |
|---|---|
| Chroma source | `E9115DBF4F268EAF04F799615B4D3CD3E16FB601E829D8E6264D2825B5C4CCAF` |
| Alpha extraction | `DEB9A5B1FBB30D56305E26D4D541FB471B4164DEB670D85A0FA475CCB2A3DAE7` |
| Transparent PNG master | `D2EDD11E338BFE82F0D76CACEFA7049F7E6AFA12639CDF7733B48A93EDCF05BA` |
| Runtime lossless WebP | `E61E4336FC738AFD852379BF242BCB125FE1BA1CF1D3C02351DA2EEA354741B4` |

## Exact prompt

```text
Use case: background-extraction
Asset type: NIGHTFALL production-candidate boss-mechanic entity combat standee
Input image: Image 1 is the approved Lantern-Smother and Smothering Shroud relationship study. Preserve the smaller Shroud's narrative relationship and restrained material language, but extract and redesign only the Smothering Shroud. Do not include the large Lantern-Smother boss or its full civic lantern cage.
Primary request: Produce exactly one Smothering Shroud: the urgent separate target formed by the Lantern-Smother before it consumes the fallen Way-lantern's protective light. It must read as an action in the process of closing, not a miniature boss, ghost, orb, or generic fog cloud.
Subject and silhouette: a compressed vertical veil/knot of purple-grey Gloom stretched around one dim stolen ember spark. Build a sharp, asymmetrical broken-ring silhouette from four or five broad taut inward-pulling strands, with a visible narrow opening that is actively closing around the spark. Include one tiny fragment of cracked lantern lens and a simple copper retention ring at the center to connect it to the civic lantern, but no full lantern cage. The outer contour should feel strained and cinched, with a decisive inward directional flow.
Production correction: reduce surface microdetail by roughly 40%. Use two large value masses plus the small ember focal point. All smoke strands must remain connected into one coherent target silhouette; no detached wisps, particles, or islands. Make the closing ring and trapped spark unmistakable at 72x96 and recognizable at 32x38.
Style/medium: painterly dark-fantasy game illustration with broad authored brush planes, disciplined readable shape language, twilight-gothic memory horror, and restrained ashen relic-craft. Solemn, tactile, not photorealistic or glossy 3D.
Composition/framing: exactly one full entity, tall 31:36 combat-standee composition, canonically leaning/facing screen-right. Centered with generous clear padding around every edge, no cropping, no floor, no dramatic foreshortening.
Scene/backdrop: perfectly flat solid #00ff00 chroma-key background for local removal. One uniform color with no gradient, texture, floor plane, vignette, atmospheric fog, shadow, reflection, or lighting variation. Do not use #00ff00 or similar green in the entity.
Lighting/mood: soft top-left key, cool twilight fill, one weak confined warm spark being visibly compressed.
Color palette: restrained #776c91 purple-grey Gloom, soot-black shadow, a tiny cracked ash lens fragment, a minimal aged-copper ring, one dim #d99a4e ember.
Constraints: exactly one entity; no Lantern-Smother boss, no full lantern cage, second creature, humanoid body, face, arms, scenery, floor, cast/contact shadow, text, UI, badge, frame, or watermark.
Avoid: miniature boss, generic ghost, featureless orb, smoke ball, jellyfish, flower, portal, eye, tentacles, bright purple aura, excessive particles, detached smoke, ornate machinery, MMO spell effect, photorealism, glossy 3D, anime, pixel art, or chibi.
```
