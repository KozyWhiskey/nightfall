# Gloomwood Spear Production Candidate

**Date:** 2026-08-03
**Tool:** Built-in image generation; model identifier is not surfaced by the built-in tool
**Status:** Approved master v2; technical QA passed, reviewer approved 2026-08-03

## Files

| File | Role | Judgment |
|---|---|---|
| `gloomwood_spear_candidate_chroma_v1.png` | First generated chroma source | Rejected: shaft was too slight to retain a confident 32 px read |
| `gloomwood_spear_candidate_alpha_v1.png` | First chroma extraction | Retained for comparison |
| `gloomwood_spear_candidate_normalized_v1.png` | First 1024 px normalized comparison | Retained for comparison |
| `gloomwood_spear_candidate_runtime_v1.webp` | First 512 px runtime comparison | Retained for comparison |
| `gloomwood_spear_candidate_qa_v1.png` | First alpha and size sheet | Rejected: 32 px shaft collapsed into the field |
| `gloomwood_spear_candidate_chroma_v2.png` | Targeted readability revision source | Selected source |
| `gloomwood_spear_candidate_alpha_v2.png` | Cleaned alpha source | Selected cleanup source |
| `gloomwood_spear_candidate_normalized_v2.png` | Normalized transparent master comparison | Selected normalization source |
| `gloomwood_spear_candidate_runtime_v2.webp` | Runtime comparison derivative | Selected runtime source |
| `gloomwood_spear_candidate_qa_v2.png` | Current alpha, field-color, size, and grayscale sheet | Passed technical and visual review |

Master: [`art/masters/items/gloomwood_spear.png`](../../../../masters/items/gloomwood_spear.png) — transparent `1024 × 1024` PNG.

Runtime review derivative: [`packages/client/public/art/items/gloomwood_spear.webp`](../../../../../packages/client/public/art/items/gloomwood_spear.webp) — lossless transparent `512 × 512` WebP.

## Post-processing record

- Removed the generated green field with the installed `remove_chroma_key.py` helper using border auto-key, soft matte, thresholds `12/220`, and despill.
- Selected v2 key color: `#12e610`.
- Selected alpha extraction: `1,408,373 / 1,572,516` transparent pixels and `3,840` partially transparent pixels.
- Cropped to nonzero alpha bounds, normalized the longest visible extent to `858 px`, and centered the result on the required `1024 × 1024` transparent master canvas.
- Final alpha bounds: `(95, 83)–(928, 941)`; occupancy `81.3% × 83.8%`; all four corner alpha values are `0`.
- Created the runtime derivative at `512 × 512` as lossless WebP.
- Verified the selected master at `128 × 128`, `64 × 64`, and `32 × 32` in color and grayscale. The v2 broader leaf head, thicker shaft, copper breaks, and cool wood plane retain the spear read at the smallest size.
- Automated fringe scan found no green-dominant visible pixels in the selected alpha source, master, or runtime derivative.

## Integrity hashes

| File | SHA-256 |
|---|---|
| Selected chroma source | `C8FEE187D4DF0834C6DAC1784DC63EC94A75E7C1482360F833C943AB3A01082E` |
| Transparent PNG master | `9A7F8886703E57A2460B46850F437B1C5AEBD08160090FF667BC979640267300` |
| Runtime lossless WebP | `118D33E79F86F6BADE1E58EC2C18718FDECDA13305674585AEF9C788C64FB357` |

## Exact prompts

### Chroma candidate v1

```text
Use case: stylized-concept
Asset type: NIGHTFALL production-candidate source for a square game inventory item, Gloomwood Spear base vessel.

Primary request: Create exactly one credible medieval spear: a long, straight, dark gloomwood shaft with a broad practical leaf-shaped iron spearhead. This is a universal reach weapon that punishes an already Exposed target; its silhouette must read instantly as a spear at 32 px. The shaft is storm-dark wood with restrained bark grain, one old leather grip wrap at the lower third, two small hammered-copper repair bands, and a subtle dark root seam held closed by one iron staple. The spearhead is soot-dark, pitted, slightly asymmetric from repair, and has one small bright dull-metal edge catch. No magical glow or active effect.

Scene/backdrop: perfectly flat solid #00ff00 chroma-key background for local background removal. The background must be one uniform color from corner to corner with no shadows, gradients, texture, reflections, floor plane, lighting variation, vignette, or halo. Do not use #00ff00 anywhere in the spear.

Style/medium: painterly dark-fantasy game item illustration, disciplined simplified value grouping, tactile authored brushwork, bold continuous contour, twilight-gothic and ashen relic-craft language. Practical Salvaged-quality vessel, not a rare or legendary weapon. Not photorealistic or glossy 3D.

Composition/framing: exactly one isolated spear, centered diagonally from lower-left butt to upper-right tip on a square canvas. Fill roughly 80% of the frame, keep the entire weapon visible with generous even padding, no perspective foreshortening.

Lighting/mood: soft top-left key and cool neutral fill confined to the object; no cast shadow, contact shadow, reflection, or background spill.

Constraints: one object only; no hand, person, animal, shield, scabbard, second weapon, detached shards, text, UI, rarity gem, badge, watermark, blood, skull, fire, aura, particles, runes, ornate filigree, oversized fantasy blade, trident, halberd, pike, banner, pristine royal weapon, modern machinery, photorealism, glossy 3D, anime, pixel art, or chibi. No shadow, no halo, no extra object.
```

### Readability revision v2

```text
Use case: precise-object-edit
Asset type: NIGHTFALL production-candidate source for a square game inventory item.
Input image: Image 1 is the current Gloomwood Spear chroma-key candidate.

Primary request: Make only the silhouette and value changes needed for inventory-size clarity. Preserve exactly one isolated practical spear, the same diagonal lower-left butt to upper-right tip composition, overall canvas occupancy, soot-dark leaf spearhead, storm-dark gloomwood shaft, lower-third leather grip, two restrained hammered-copper repair bands, one iron staple, and the painterly Salvaged-quality style.

Required changes:
1. Thicken the visible wood shaft by about 35% along its full exposed length. It must read as a clear dark wooden pole at 32x32, not a hairline.
2. Widen the leaf-shaped spearhead by about 20%, preserving a credible symmetrical spear point. Keep it practical and unadorned.
3. Add one broad restrained cool-grey value plane along the shaft so the full weapon separates from #0d171b at 32x32. This is wood grain and edge light, not glow.
4. Simplify tiny shaft texture by about 20%; preserve the long root seam and one iron staple.

Invariants: keep the background a perfectly flat uniform #00ff00 chroma-key color with no texture, gradient, shadow, halo, or spill. Do not use green in the spear. No change to the object count, composition, copper tone, lighting, or restrained material story.

Avoid: no halberd, trident, pike, banner, axe blade, ornate filigree, runes, magical glow, fire, aura, particles, extra object, hand, person, text, UI, watermark, photorealism, glossy 3D, anime, pixel art, or chibi.
```
