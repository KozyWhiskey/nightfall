# Gloomfang Hound Production Candidate

**Date:** 2026-08-01
**Tool:** Built-in image generation; model identifier is not surfaced by the built-in tool
**Status:** Candidate v1; technical QA passed, reviewer approval pending

## Files

| File | Role |
|---|---|
| `gloomfang_hound_candidate_chroma_v1.png` | Immutable generated chroma source |
| `gloomfang_hound_candidate_alpha_v1.png` | Cleaned alpha extraction before contract framing |
| `gloomfang_hound_candidate_qa_v1.png` | Field-color, alpha, runtime-size, and grayscale review sheet |

Master: [`art/masters/enemies/gloomfang_hound.png`](../../../../masters/enemies/gloomfang_hound.png) — transparent `992 × 1152` PNG.

Runtime review derivative: [`packages/client/public/art/enemies/gloomfang_hound.webp`](../../../../../packages/client/public/art/enemies/gloomfang_hound.webp) — lossless transparent `496 × 576` WebP.

## Post-processing and QA record

- Removed the generated green field with the installed `remove_chroma_key.py` helper using border auto-key, soft matte, thresholds `12/220`, and despill.
- Detected border key: `#0bf80b`.
- Extraction: `1,090,760 / 1,572,186` transparent pixels and `19,253` partially transparent pixels.
- Cropped to the alpha bounds and proportionally framed the width-limited quadruped on the required `992 × 1152` master without stretching.
- Final alpha bounds: `(60, 442)–(932, 1083)`; top safe area `38.37%`; side safe areas `6.05% / 6.05%`; ground line `94.01%`; all corner alpha values are `0`.
- Created the runtime derivative at `496 × 576` as lossless WebP (`127,964` bytes).
- The automated fringe scan found `358` muted green-dominant master pixels above alpha `8`; only `30` exceed alpha `64` and one exceeds alpha `128`. No visible green edge appears on either required field color or the checkerboard.
- Source-sheet review passed at `86 × 115`, `72 × 96`, and `32 × 38` on both required field colors and in grayscale. The low hunting silhouette, long muzzle, copper collar, shoulder scar, and attached Gloom-fray remain identifiable; fine ribs and fungal detail appropriately recede at initiative size.
- Live `?artReview=anchors` review passed neutral, active, targetable, acting, downed, and linked treatments. Nine Hound images decoded from the `496 × 576` WebP, all hostile presentations use the required horizontal mirror, and the page has no horizontal overflow.
- Only the client was started for this review. The fixture is presentation-only; a host-backed combat run was not claimed or required for this candidate gate.

## Integrity hashes

| File | SHA-256 |
|---|---|
| Chroma source | `FCC47A3C5E0F31ACD235FE7F9A57351C67FAE054B043637D6BD19C77827087B1` |
| Alpha extraction | `A4D05C864C09E6E50D9C32A694CC4460856C9997935BB29445E5805799D96797` |
| Transparent PNG master | `C7DB56BF026C7EA9FA506E184EBA9221E6853A4F68E67FEA88F28B97904777DD` |
| Runtime lossless WebP | `60F7B50B61CDC4AE4D529C1BC9D10EA8E358288359F0D7E55AE410F8BFA37748` |

## Exact prompt

```text
Use case: background-extraction
Asset type: production combat standee for NIGHTFALL, a dark turn-based roguelite
Input image: Image 1 is the approved Gloomfang Hound exploration and identity reference.
Primary request: Re-render the same Gloomfang Hound as a clean production cutout source while preserving its recognizable identity and design.
Scene/backdrop: perfectly flat solid #00ff00 chroma-key background for later removal. The background must be one uniform color with no gradients, texture, floor plane, vignette, atmospheric haze, shadows, reflections, or lighting variation.
Subject: one lean, credible working hound/wolf corrupted by the Gloom; worn empty leather collar with a small unmarked aged-copper plate; low forward hunting stance; long muzzle; arched shoulders; visible negative spaces between all four legs; facing screen-right. Preserve the small pale fungal scar cluster on the shoulder without gore. Preserve restrained purple-grey Gloom smoke-fray, but simplify it into only a few broad, controlled ribbons attached to the spine, tail, and rear limbs. No detached particles or floating islands.
Style/medium: painterly dark-fantasy game concept art matching the reference; production-readable standee with 25–35% less microdetail, two or three strong value masses, and slightly brighter ash separation on the head, spine, and forelegs.
Composition/framing: entire creature visible, including ears, muzzle, tail-fray, and every paw; centered with generous clear padding on all sides; horizontal speed silhouette; no cropping.
Lighting/mood: restrained cold directional light, predatory and tragic rather than monstrous spectacle.
Color palette: charcoal, ash grey, sparse desaturated purple-grey Gloom, tiny warm amber eye and aged-copper collar accents. Do not use #00ff00 or similar green anywhere in the creature.
Constraints: preserve quadruped anatomy and the approved design; exactly one creature; crisp separable outer contour; no cast shadow, contact shadow, text, logo, frame, or watermark.
Avoid: extra limbs, fused legs, werewolf anatomy, bulky monster proportions, cute pet expression, neon purple fog, magical particle cloud, scenery, floor, pedestal, gore, bright green contamination.
```
