# Shattered Husk Production Candidate

**Date:** 2026-08-02
**Tool:** Built-in image generation; model identifier is not surfaced by the built-in tool
**Status:** Approved master v1; integrated and verified, reviewer approval recorded 2026-08-03

## Files

| File | Role |
|---|---|
| `shattered_husk_candidate_chroma_v1.png` | Immutable generated chroma source |
| `shattered_husk_candidate_alpha_v1.png` | Cleaned alpha extraction before contract framing |
| `shattered_husk_candidate_qa_v1.png` | Field-color, alpha, runtime-size, and grayscale review sheet |

Master: [`art/masters/enemies/shattered_husk.png`](../../../../masters/enemies/shattered_husk.png) — transparent `992 × 1152` PNG.

Runtime review derivative: [`packages/client/public/art/enemies/shattered_husk.webp`](../../../../../packages/client/public/art/enemies/shattered_husk.webp) — lossless transparent `496 × 576` WebP.

## Post-processing and QA record

- Generated directly against the approved Vanguard human-material reference and Gloomfang Hound corruption reference; neither reference was treated as an edit target.
- Removed the generated green field with the installed `remove_chroma_key.py` helper using border auto-key, soft matte, thresholds `12/220`, and despill.
- Detected border key: `#03f904`; extraction produced `1,019,435 / 1,572,564` transparent pixels and `9,386` partially transparent pixels.
- Cropped to alpha bounds and proportionally framed the Husk on the required `992 × 1152` master without stretching.
- Final alpha bounds: `(149, 50)–(843, 1083)`; top safe area `4.34%`; side safe areas `15.02% / 15.02%`; ground line `94.01%`; all corner alpha values are `0`.
- Created the runtime derivative at `496 × 576` as lossless WebP (`173,272` bytes).
- Automated fringe scan found `248` muted green-dominant master pixels above alpha `8`; `43` exceed alpha `64`, with maximum alpha `185`. The runtime derivative has `98`, all at alpha `62` or lower. No visible green edge appears on either required field color or the checkerboard.
- Source-sheet review passed at `86 × 115`, `72 × 96`, and `32 × 38` on both required field colors and in grayscale. The bowed head, pack-backed wedge, guard arm, and dragging hand remain readable; face fractures and small repairs appropriately recede at initiative size.
- Live `?artReview=anchors` review passed neutral, active, targetable, acting, downed, and linked treatments with the Husk-specific `Mourning Blow` acting callout. Nine Husk images decoded from the `496 × 576` WebP, all hostile presentations use the required horizontal mirror, and the page has no horizontal overflow.
- Only the client was started for this review. The fixture is presentation-only; a host-backed combat run was not claimed or required for this candidate gate.

## Integrity hashes

| File | SHA-256 |
|---|---|
| Chroma source | `9C5AB38485A7B46465AC8816609ADC980CA24EA48A95FAF89E9AD2B9E672A8A9` |
| Alpha extraction | `A557C565650D28593E940B11FC91A17959F089F6B0A65D1E3CB388AE602F3BFC` |
| Transparent PNG master | `F77C09031A207EF1ADF802AE6B24F10119494D96C3229D0E983A5833329CD1CE` |
| Runtime lossless WebP | `E0CDE235024F2F67E520479DC966B5F390E52D1022FC6D74AD740789CDC0E316` |

## Exact prompt

```text
Use case: background-extraction
Asset type: NIGHTFALL production-candidate Band-1 enemy combat standee
Input images:
- Image 1 is the approved Vanguard master and a rendering/material reference only. Match its broad painterly planes, practical travel-worn human construction, restrained palette, and source-scale discipline. Do not copy the person, face, shield, sword, armor, pose, or heroic bearing.
- Image 2 is the approved Gloomfang Hound master and a corruption-language reference only. Match its restrained ash separation, sparse purple-grey erosion, and tragic corrupted-frontier tone. Do not include animal anatomy, collar, fungal scar, quadruped pose, or smoke tail.
Primary request: Create exactly one Shattered Husk for NIGHTFALL: “a traveler who died too slowly; every movement carries the weight of a memory they no longer possess.” It is a durable Band-1 sorrowful-remnant tank that teaches enemy Block and target priority. It must read as former human first, defensive mass second, and Gloom corruption third—not as a generic zombie, knight, or rock golem.
Lost trace and subject: a broad adult frontier traveler in a bowed, burdened 3/4 stance, canonically facing screen-right. The remaining human face is pale, exhausted, and partly erased into two or three smooth cracked ash planes; no gore, skull face, glowing eyes, or screaming mouth. A broken wooden pack frame has settled into the shoulder line beneath a compressed weather-dark cloak, with one blank worn copper way-token and a few competent old repairs suggesting the person who once traveled.
Tank silhouette and action language: massive wedge-shaped torso, hunched shoulders, planted legs, thick layered coat hem, and two oversized heavy empty forearms/hands. One forearm is held across the torso in a natural hollow-guard posture while the other hangs forward for a slow griefswipe. No weapon and no shield. The body should feel difficult to move around, not muscular or heroic.
Corruption language: the coat, flesh, and pack frame have fractured together into a few broad misaligned plates, as though the traveler’s remembered posture was reconstructed incorrectly. Narrow recessed seams of desaturated purple-grey Gloom appear between selected planes and swallow small pieces of contour. Use only two short attached smoke-frays at the back hem/shoulder. No detached particles, floating rubble, aura, or fungus.
Production readability: use two or three major value masses and roughly 35% less surface microdetail than the references. Preserve clear negative space between both arms and the torso and between the legs. Lift ash separation on the bowed face, forward forearm, shoulder ridge, and inner-leg gaps. Broad torso, bowed head, and guard arm must read at 72x96; head-and-wedge silhouette must survive at 32x38.
Style/medium: painterly dark-fantasy game illustration with broad authored brush planes, disciplined silhouette, twilight-gothic memory horror, and corrupted frontier material weight. Solemn, mature, tactile, not photorealistic or glossy 3D.
Composition/framing: exactly one full-body humanoid enemy in a neutral combat-ready stance, tall 31:36 standee framing, screen-right-facing, consistent ground line near 94% canvas height, at least 4% clear space above and 6% on each side. Entire head, pack-frame trace, hands, coat, and boots fully separated from every edge. No dramatic foreshortening or action lunge.
Scene/backdrop: perfectly flat solid #00ff00 chroma-key background for local removal. The background must be one uniform color with no gradient, texture, floor plane, vignette, atmospheric haze, shadow, reflection, or lighting variation. Do not use #00ff00 or similar green anywhere in the Husk.
Lighting/mood: soft top-left key, cool twilight fill, no glow halo. The face is mournful and barely present; the body is oppressive and slow.
Color palette: soot-black and wet-charcoal cloth, ash-grey skin/cloth planes, dark worn wood and leather, tiny aged-copper way-token, sparse #776c91 Gloom seams. No large warm focal light.
Constraints: exactly one humanoid; anatomically coherent arms, hands, and legs; no weapon, shield, extra limb, detached body part, exposed organs, blood, scenery, floor, cast/contact shadow, text, UI, badge, frame, or watermark.
Avoid: generic zombie, skeleton, mummy, armored knight, executioner, stone golem, tree monster, hunchback caricature, giant pauldrons, full helmet, backpack clutter, pristine armor, purple fog, neon glow, excessive particles, gore, horror-comedy, photorealism, glossy 3D, anime, pixel art, or chibi.
```
