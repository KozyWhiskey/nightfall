# Vanguard Production Candidate

**Date:** 2026-08-01
**Tool:** Built-in image generation; model identifier is not surfaced by the built-in tool
**Status:** Candidate v1; technical QA passed, reviewer approval pending

## Files

| File | Role |
|---|---|
| `vanguard_candidate_chroma_v1.png` | Immutable generated chroma source |
| `vanguard_candidate_alpha_v1.png` | Cleaned alpha extraction before contract framing |
| `vanguard_candidate_qa_v1.png` | Field-color, alpha, runtime-size, and grayscale review sheet |

Master: [`art/masters/heroes/vanguard.png`](../../../../masters/heroes/vanguard.png) — transparent `992 × 1152` PNG.

Runtime review derivative: [`packages/client/public/art/heroes/vanguard.webp`](../../../../../packages/client/public/art/heroes/vanguard.webp) — lossless transparent `496 × 576` WebP.

## Post-processing and QA record

- Removed the generated green field with the installed `remove_chroma_key.py` helper using border auto-key, soft matte, thresholds `12/220`, and despill.
- Detected border key: `#0af60d`.
- Extraction: `1,032,238 / 1,572,934` transparent pixels and `7,153` partially transparent pixels.
- Cropped to the alpha bounds and proportionally framed the subject on the required `992 × 1152` master without stretching.
- Final alpha bounds: `(123, 50)–(868, 1083)`; top safe area `4.34%`; side safe areas `12.4% / 12.5%`; ground line `94.01%`; all corner alpha values are `0`.
- Created the runtime derivative at `496 × 576` as lossless WebP.
- Automated fringe scan found zero green-dominant visible pixels in both master and runtime derivative.
- Source-sheet review passed at `86 × 115`, `72 × 96`, and `32 × 38` on both required field colors and in grayscale. The sword appropriately recedes at initiative size while the face, shield, and ward aperture survive.
- Live `?artReview=anchors` review passed neutral, active, targetable, acting, downed, and linked treatments. Nine Vanguard images decoded from the `496 × 576` WebP at the expected review/state sizes, and the page had no horizontal overflow.
- Only the client was started for this review. The normal route correctly reached its host-unavailable shell; a host-backed combat run was not claimed or required for this presentation-only candidate gate.

## Integrity hashes

| File | SHA-256 |
|---|---|
| Chroma source | `9684B91214A697BF2B798F3538D93CDA8BE40F472FDCB6CE93A96A20433789C6` |
| Transparent PNG master | `D109B49DAF9592E907D146244BB2F4BC05BACE3265B8E7E3AE160F7E6DC5365F` |
| Runtime lossless WebP | `923A44D9A2D71E45EAAA49CC0CC3F3B2EB0177D799742EC0BD24F4CC47DA2F3C` |

## Exact prompt

```text
Use case: precise-object-edit and background-extraction
Asset type: NIGHTFALL production-candidate full-body combat standee for Rook, the fixed starter Vanguard

Input images:
- Image 1 is the Vanguard exploration and edit target. Preserve Rook's recognizable face, body type, pose, shield identity, and overall ashen relic-craft construction.
- Image 2 is the approved Hewn Sword candidate reference. Use its simple continuous spear-point silhouette, practical one-handed proportions, modest straight guard, soot-dark iron, leather grip, copper shoulder collar, and quiet linear Iron binding. Do not copy its square framing or background.

Primary request: Produce exactly one cleaned Vanguard standee candidate. Rook is a maintained, travel-worn male defender with a broad grounded silhouette, low center of gravity, visible tired face, Hewn Sword in his right hand, and large repaired Kite Shield in his left. He faces screen-right.

Required changes:
1. Reduce the exploration's surface micro-detail by roughly 30%. Consolidate cloth and armor into two or three broad painterly value masses; remove repeated tiny stitch rows, rivets, straps, scratches, and dangling fragments. Keep only a few purposeful competent repairs.
2. Replace the exploration sword with the simple Hewn Sword from Image 2. Keep clear negative space around its continuous outer contour; no notch or hook near the tip.
3. Simplify the kite shield into three dominant planes while preserving its large protective silhouette, repaired wood/soot-black iron, restrained copper braces, and one small controlled lantern-gold ward aperture. Remove excess tiny hardware.
4. Lift ash-value separation along the face, shoulder mantle, sword arm, inner-leg gaps, and shield rim so Rook remains legible on #0d171b and #122428 at 72x96 without an outline or halo.
5. Keep Rook's short hair and beard as compact opaque painterly shapes with clean edges suitable for chroma removal; no flyaway wisps.
6. Preserve the visible human face and broad defender bearing. Do not redesign him into a different person or seal him in a full helmet.

Composition: exactly one full-body adult man in the same neutral combat-ready 3/4 stance, canonically facing screen-right. Tall 31:36 standee framing; consistent ground line near 94% canvas height; at least 4% clear space above the silhouette and 6% on each side, with extra space around the sword. Entire sword, shield, hair, boots, and cloak fully separated from every canvas edge. No dramatic foreshortening or action lunge.

Scene/backdrop: perfectly flat solid #00ff00 chroma-key background for local removal. The background must be one uniform color from corner to corner: no shadow, floor plane, reflection, gradient, vignette, texture, lighting variation, scenery, mist, or halo. Do not use #00ff00 anywhere in Rook or his gear.

Style/medium: visibly painterly dark-fantasy game standee with broad authored brush planes, disciplined silhouette, twilight-gothic emotion, ashen relic-craft material culture, and mature roguelite tone. Tactile but simplified; not photorealistic or glossy 3D.

Lighting and palette: soft top-left key, cool twilight fill confined to the subject, restrained warm reflection near the shield aperture. Soot-black iron, ash neutrals, muted leather, aged copper, one sparse lantern-gold accent. No cast/contact shadow and no green spill.

Readability: shield line and broad torso clear at 86x115 and 72x96; face, shield shape, and ward aperture survive at 32x38.

Constraints: exactly one character; anatomically coherent hands gripping sword and shield; preserve all unmentioned identity decisions; no extra character, extra weapon, scenery, text, UI, badge, watermark, floor shadow, full helmet, modern object, science-fiction machinery, steampunk excess, pristine plate armor, giant fantasy sword, ornate filigree, oversized pauldrons, glowing eyes, neon bloom, purple fog, excessive particles, photorealism, glossy 3D, anime, pixel art, chibi, or comedy pose.
```
