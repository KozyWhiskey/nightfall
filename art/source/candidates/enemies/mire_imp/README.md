# Mire Imp Production Candidate

**Date:** 2026-08-03  
**Tool:** Built-in image generation; model identifier is not surfaced by the built-in tool  
**Status:** Candidate v1; integrated and technically verified, reviewer approval pending

## Files

| File | Role |
|---|---|
| `mire_imp_candidate_chroma_v1.png` | Immutable generated chroma source |
| `mire_imp_candidate_alpha_v1.png` | Cleaned alpha extraction before contract framing |
| `mire_imp_candidate_qa_v1.png` | Field-color, alpha, runtime-size, and grayscale review sheet |

Master: [`art/masters/enemies/mire_imp.png`](../../../../masters/enemies/mire_imp.png) — transparent `992 × 1152` PNG.

Runtime review derivative: [`packages/client/public/art/enemies/mire_imp.webp`](../../../../../packages/client/public/art/enemies/mire_imp.webp) — lossless transparent `496 × 576` WebP.

## Post-processing and QA record

- Generated directly against the approved Gloomfang Hound and Smothering Shroud masters as rendering and shape-language references only; neither reference was treated as an edit target.
- Removed the generated green field with the installed `remove_chroma_key.py` helper using border auto-key, soft matte, thresholds `12/220`, and despill.
- Detected border key: `#05f907`; extraction produced `1,229,582 / 1,572,128` transparent pixels and `12,470` partially transparent pixels.
- Cropped to alpha bounds and proportionally framed the Imp on the required `992 × 1152` master without stretching. Deliberate `780 px` subject height preserves its small-disruptor scale instead of filling the human standee contract.
- Final alpha bounds: `(114, 303)–(877, 1083)`; top safe area `26.30%`; side safe areas `11.49% / 11.59%`; ground line `93.92%`; all corner alpha values are `0`.
- Created the runtime derivative at `496 × 576` as lossless WebP (`107,430` bytes).
- A conservative automated scan found `657` green-dominant visible master pixels. Inspection on both required dark field colors and the checkerboard found no visible chroma fringe; the detected pixels are confined to subpixel edge residue and muted material color.
- Source-sheet review passed at `86 × 115`, `72 × 96`, and `32 × 38` on both required field colors and in grayscale. The low triangular crouch, pale stolen-voice aperture, asymmetric shoulder fin, and forward casting hand remain readable; surface texture appropriately recedes at initiative size.
- Live `?artReview=anchors` review passed neutral, active, targetable, acting, downed, and linked treatments with the Imp-specific `Whisper Bolt` acting callout. Nine Imp images decoded from the `496 × 576` WebP, all hostile presentations use the required horizontal mirror, and the page has no horizontal overflow.
- Only the client was started for this review. The fixture is presentation-only; a host-backed combat run was not claimed or required for this candidate gate.

## Integrity hashes

| File | SHA-256 |
|---|---|
| Chroma source | `73C390574C79963C0CEFF62ACB12A2E4D76FF672E6D7ED0DDE0AE0C1445073F6` |
| Alpha extraction | `8A801089D6AB82B6FAFAE4469E949B4B554312855C593318AFF879A9BCE13D6B` |
| Transparent PNG master | `154D892D1C2FB7D0FF9840B18D6BBB2BACBCB2E1258A2C1E9A54D9E332D4E6D9` |
| Runtime lossless WebP | `BA3E9A7B77403168D3A23C670E4F5DFAB0336C3B2142FDDC8FE1CD4749A2C6FA` |

## Exact prompt

```text
Use case: background-extraction
Asset type: NIGHTFALL production-candidate Band-1 enemy combat standee
Input images:
- Image 1 is the approved Gloomfang Hound master and a rendering/corruption reference only. Match its broad painterly planes, restrained dark palette, ash separation, sparse purple-grey erosion, and tragic frontier tone. Do not include wolf anatomy, fur, collar, fungal scar, quadruped pose, or tail.
- Image 2 is the approved Smothering Shroud master and a shape-language reference only. Borrow only its taut inward-pulling rhythm and disciplined purple-grey value grouping. Do not include its lantern spark, copper ring, floating veil body, scale, or composition.
Primary request: Create exactly one Mire Imp for NIGHTFALL: “a small, warped knot of fear that giggles with voices stolen from people who did not come home.” It is a fragile but dangerous Band-1 fear-born parasite whose whisper attacks apply Exposed. It must read as a high-priority disruptor despite its small physical scale—not as a comic goblin, horned demon, or child-sized humanoid.
Lost trace and subject: a knee-high crouched parasite assembled from peat-dark root knots, wet bark plates, and two or three strips of abandoned traveler cloth. It has a compact asymmetrical torso, low bent legs, and two long thin arms with clearly separated hooked fingers. The head is a small eyeless knot tucked behind the shoulders, not a conventional face. A single pale stolen-voice aperture is pinched into the upper chest/throat: three overlapping smooth ash membranes form one narrow whisper opening, suggesting several remembered voices without literal extra mouths, faces, teeth, or gore.
Priority silhouette and action language: low triangular crouch, large pale throat aperture, one long forward hand splayed toward screen-right as if releasing a whisper bolt, and the other hand clutching the chest knot. Use one sharply raised shoulder/root fin to create an anxious asymmetric profile. The body is wiry and fragile, never muscular or armored. No weapon, wings, horns, tail, or large ears.
Corruption language: sparse desaturated purple-grey Gloom appears only in the recessed seams around the voice aperture and along two attached root tips. Contours pull inward toward the chest, making the creature feel cinched by stolen voices. No detached smoke, aura, floating particles, slime, or fungus.
Production readability: use two major dark value masses plus the pale voice aperture. Reduce surface microdetail by roughly 40%. Preserve negative space between both arms, torso, and legs. Lift ash separation on the aperture, forward hand, shoulder fin, and shins. The crouch, forward hand, and pale throat must read at 72x96; triangular knot plus pale aperture must survive at 32x38.
Style/medium: painterly dark-fantasy creature illustration with broad authored brush planes, disciplined game-readable silhouette, twilight-gothic memory horror, and corrupted frontier material weight. Disturbing and sorrowful, not cute, comedic, photorealistic, or glossy 3D.
Composition/framing: exactly one complete small creature in a neutral skitter-ready 3/4 stance, canonically facing screen-right. Tall 31:36 source composition with generous clear padding around every edge. Entire head knot, shoulder fin, hands, root tips, and feet fully separated from the canvas. No dramatic foreshortening or action lunge. The production master will preserve it at roughly 65–70% of human standee height.
Scene/backdrop: perfectly flat solid #00ff00 chroma-key background for local removal. The background must be one uniform color with no gradient, texture, floor plane, vignette, atmospheric haze, shadow, reflection, or lighting variation. Do not use #00ff00 or similar green anywhere in the Imp.
Lighting/mood: soft top-left key, cool twilight fill, no halo. The pale voice aperture is the decision-relevant focal point but does not glow brightly.
Color palette: peat-black and wet-charcoal bark, muted ash membrane and fingers, tiny remnants of weather-dark cloth, sparse #776c91 Gloom seams. No warm focal light and no neon.
Constraints: exactly one creature; coherent two-arm/two-leg anatomy; no extra mouth, face collage, visible teeth, exposed organs, blood, weapon, scenery, floor, cast/contact shadow, text, UI, badge, frame, or watermark.
Avoid: goblin, gremlin, troll, child, horned imp, bat demon, fairy, insect, spider, frog, cute mascot, comic grin, giant ears, wings, tail, glowing eyes, skull face, screaming mouth, body horror gore, purple fog, neon aura, excessive particles, photorealism, glossy 3D, anime, pixel art, or chibi.
```
