# Hewn Sword Production Candidate

**Date:** 2026-08-01
**Tool:** Built-in image generation; model identifier is not surfaced by the built-in tool
**Status:** Candidate v3; technical QA passed, reviewer approval pending

## Files

| File | Role | Judgment |
|---|---|---|
| `hewn_sword_candidate_chroma_v1.png` | First generated chroma source | Rejected: retained the large upper-edge notch |
| `hewn_sword_candidate_chroma_v2.png` | Corrected immutable chroma source | Selected source |
| `hewn_sword_candidate_alpha_v2.png` | First chroma extraction | Matte passed; values too dark at 32 px |
| `hewn_sword_candidate_alpha_v3_tonelift.png` | Cleaned alpha source with restrained value correction | Selected cleanup source |
| `hewn_sword_candidate_qa_v2.png` | Pre-correction size sheet | Retained to document the failed value check |
| `hewn_sword_candidate_qa_v3.png` | Current alpha, field-color, size, and grayscale sheet | Pass pending browser fixture |

Master: [`art/masters/items/hewn_sword.png`](../../../../masters/items/hewn_sword.png) — transparent `1024 × 1024` PNG.

Runtime review derivative: [`packages/client/public/art/items/hewn_sword.webp`](../../../../../packages/client/public/art/items/hewn_sword.webp) — lossless transparent `512 × 512` WebP.

## Post-processing record

- Removed the generated green field with the installed `remove_chroma_key.py` helper using border auto-key, soft matte, thresholds `12/220`, and despill.
- Detected border key: `#0af218`.
- Initial extraction: `1,418,448 / 1,572,516` transparent pixels and `3,687` partially transparent pixels.
- Lifted object brightness by `18%` and contrast by `4%` after the first `32 × 32` check collapsed into the field colors.
- Scaled the cleaned source to `983 × 983` and centered it on the required `1024 × 1024` transparent master canvas.
- Final alpha bounds: `(117, 92)–(930, 950)`; occupancy `79.4% × 83.8%`; all four corner alpha values are `0`.
- Created the runtime derivative at `512 × 512` as lossless WebP.
- Verified the runtime WebP in the live `?artReview=anchors` fixture at exact `128`, `64`, and `32` px rendered sizes. The decoded source is `512 × 512`; the page has no horizontal overflow.
- Automated fringe scan found only two green-dominant runtime pixels, both nearly transparent (`alpha 17` and `22`) and not visibly contaminating either required field color.

## Integrity hashes

| File | SHA-256 |
|---|---|
| Selected chroma source | `B72496D95C6F607982E10C81DB9200E805FE99C2D1E9E147D93C659401EDE5C4` |
| Transparent PNG master | `1DF08FA5307DC58F8FDC92010C688F36A42D3BF2A50A2B4691101767232F5158` |
| Runtime lossless WebP | `CCB1D4568E9973D10DE8EBC65DA6CE1AFCAA496ACF54874BDE53DC3CF02132C4` |

## Exact prompts

### Chroma candidate v1

```text
Use case: precise-object-edit and background-extraction
Asset type: NIGHTFALL production-candidate source for a square game inventory item
Input image: Image 1 is the accepted Hewn Sword exploration and edit target.

Primary request: Preserve the same single one-handed sword, diagonal lower-left grip to upper-right tip composition, practical arming-sword proportions, soot-dark iron, modest straight guard, worn leather grip, simple weighted pommel, hammered-copper repair collar immediately above the guard, and one quiet straight bound-force incision. Change only the blade-tip repair, rendering discipline, and background.

Required object changes:
1. Replace the awkward hooked/notched interruption near the upper blade edge with one small shallow repaired edge nick. The outer silhouette must remain a clean, believable worn spear-point and read immediately as a sword at 32x32.
2. Simplify surface rendering by roughly 25%. Use broad painterly planes and selective edge catches rather than dense pebbled micro-texture.
3. Keep the copper collar structurally credible and restrained. It is the only warm material accent.
4. Keep the Iron binding as one subtle straight compressed incision with a dull pale-metal catch; no colored glow.

Composition: exactly one isolated sword, centered diagonally from lower-left grip to upper-right tip on a square canvas. Fill roughly 78–82% of the frame, with generous even padding and no perspective foreshortening. Entire weapon visible and fully separated from every canvas edge.

Scene/backdrop: perfectly flat solid #00ff00 chroma-key background for local background removal. The background must be one uniform color from corner to corner with no shadows, gradients, texture, reflections, floor plane, lighting variation, vignette, or halo. Do not use #00ff00 anywhere in the sword.

Style/medium: painterly dark-fantasy game item illustration with disciplined simplified value grouping, tactile authored brushwork, bold contour, twilight-gothic and ashen relic-craft language. Practical Salvaged-quality vessel, not a legendary weapon. Not photorealistic or glossy 3D.

Lighting: soft top-left key and cool neutral fill confined to the object; no cast shadow, contact shadow, reflection, or background spill.

Constraints: preserve all unmentioned object decisions; exactly one sword; crisp continuous silhouette; no hand, character, shield, scabbard, second weapon, text, UI, rarity gem, badge, watermark, blood, skull, fire, aura, particles, glowing runes, ornate filigree, giant fantasy blade, greatsword proportions, pristine royal weapon, modern machinery, photorealism, glossy 3D, anime, pixel art, or chibi. No shadow, no halo, no extra object.
```

### Tip correction v2

```text
Use case: precise-object-edit
Input image: Image 1 is the Hewn Sword chroma-key production candidate.

Primary request: Change only the upper blade silhouette. Remove the large hooked notch/step from the cutting edge completely. Reconstruct that missing metal so the cutting edge runs as one continuous, gently tapering line from the blade shoulder to a simple symmetrical worn spear point. There must be no hook, bite, notch, cutout, step, barb, serration, or missing chunk anywhere near the tip. A tiny shallow surface scar may be painted inside the blade, but it must not interrupt the outer contour.

Invariants: preserve exactly one sword; preserve the practical one-handed proportions, diagonal lower-left to upper-right placement, full-object framing, soot-dark iron, modest straight guard, leather grip, weighted pommel, copper repair collar above the guard, subtle straight Iron incision, painterly simplified rendering, lighting, scale, and padding. Preserve the perfectly flat uniform #00ff00 background exactly.

Background constraints: one uniform #00ff00 color from corner to corner; no gradient, texture, shadow, reflection, vignette, halo, or color spill; do not use #00ff00 in the sword.

Do not change anything except filling and smoothing the upper blade edge. No extra object, text, UI, watermark, hand, scabbard, glow, particles, or decoration.
```
