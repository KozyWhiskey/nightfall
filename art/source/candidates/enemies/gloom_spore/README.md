# Gloom Spore Production Candidate

**Date:** 2026-08-03  
**Tool:** Built-in image generation; model identifier is not surfaced by the built-in tool  
**Status:** Approved master v1; integrated and verified, reviewer approval recorded 2026-08-03

## Files

| File | Role |
|---|---|
| `gloom_spore_candidate_chroma_v1.png` | Immutable generated chroma source |
| `gloom_spore_candidate_alpha_v1.png` | Cleaned alpha extraction before contract framing |
| `gloom_spore_candidate_qa_v1.png` | Field-color, alpha, runtime-size, and grayscale review sheet |

Master: [`art/masters/enemies/gloom_spore.png`](../../../../masters/enemies/gloom_spore.png) — transparent `992 × 1152` PNG.

Runtime review derivative: [`packages/client/public/art/enemies/gloom_spore.webp`](../../../../../packages/client/public/art/enemies/gloom_spore.webp) — lossless transparent `496 × 576` WebP.

## Post-processing and QA record

- Generated directly against the Mire Imp and Gloomfang Hound masters as fear-parasite rendering/material and restrained corruption references only; neither reference was treated as an edit target.
- Removed the generated green field with the installed `remove_chroma_key.py` helper using border auto-key, soft matte, thresholds `12/220`, and despill.
- Detected border key: `#04f905`; extraction produced `1,115,076 / 1,572,750` transparent pixels and `8,772` partially transparent pixels.
- Cropped to alpha bounds and proportionally framed the Spore on the required `992 × 1152` master without stretching. Deliberate `700 px` subject height preserves its squat 60–65%-of-human gameplay scale.
- Final alpha bounds: `(191, 383)–(800, 1083)`; top safe area `33.25%`; side safe areas `19.25% / 19.35%`; ground line `93.92%`; all corner alpha values are `0`.
- Created the runtime derivative at `496 × 576` as lossless WebP (`74,356` bytes).
- Automated fringe scan found `7` green-dominant master pixels above alpha `8`, all at alpha `40` or lower. The runtime derivative has `8`, all at alpha `41` or lower. No visible green edge appears on either required field color or the checkerboard.
- Source-sheet review passed at `86 × 115`, `72 × 96`, and `32 × 38` on both required field colors and in grayscale. The overpressured orb, diagonal three-scar cadence, marker shard, side vent, and four-root star base survive at their intended contract sizes.
- Live `?artReview=anchors` review passed neutral, active, targetable, acting, downed, and linked treatments with the Spore-specific `Swell` acting callout. Nine Spore images decoded from the `496 × 576` WebP, all hostile presentations use the required horizontal mirror, and the page has no horizontal overflow.
- Only the client was started for this review. The fixture is presentation-only; a host-backed combat run was not claimed or required for this candidate gate.

## Integrity hashes

| File | SHA-256 |
|---|---|
| Chroma source | `30C32BC7C2560C3E7B73554539FD70B96D8F1F35AC2C31E8DCE726EBA442DB53` |
| Alpha extraction | `43836D1D3A0D0A4C5DC587CDE89BAD9C2D1E8F13DD271BA74AA3B33770B75C36` |
| Transparent PNG master | `0334FA8672CC7A40816D7BCB7C41C0383D437630C80628BE92E8D3C63F4E7CFA` |
| Runtime lossless WebP | `3C1608E9D589D3F63B85B09F331EB837949D3864FDB7B49AB4B78EAD2572ABDC` |

## Exact prompt

```text
Use case: background-extraction
Asset type: NIGHTFALL production-candidate Band-1 enemy combat standee
Input images:
- Image 1 is the Mire Imp master and a fear-born parasite rendering/material reference only. Match its broad painterly planes, peat-dark root construction, pale membrane separation, sparse purple-grey Gloom seams, and compact corrupted-frontier tone. Do not include its humanoid anatomy, hands, legs, throat aperture, head knot, shoulder fin, or crouched character pose.
- Image 2 is the Gloomfang Hound master and a restrained corruption/fungal reference only. Borrow its tragic material weight, ash separation, disciplined dark palette, and small crusted infection language. Do not include wolf anatomy, fur, collar, eyes, quadruped body, smoke tail, or hunting pose.

Primary request: Create exactly one Gloom Spore for NIGHTFALL: “a swollen fungal sac repeating one remembered word until it bursts into black mist.” It is a stationary Band-1 fear-born parasite and exploder whose telegraphed Swell forces a party-wide Rupture unless the player kills, Stuns, or defends against it. Its base silhouette must communicate stored pressure and imminent self-destruction—not a generic fantasy mushroom, plant monster, egg, or cute creature.

Lost trace and subject: a low, corporeal fungal pressure-sac grown around one short splinter of a weathered frontier trail marker. The embedded wood shard rises asymmetrically from the rear-left of the body and has no readable writing. The main body is an oversized taut pear-shaped bladder made from three broad overlapping charcoal fungal lobes cinched around a narrow central pressure seam. It sits on exactly four short splayed peat-root struts, giving it a planted star-like base with no animal feet or legs.

Remembered-word language: exactly three identical sealed ash-grey scar-impressions repeat diagonally around the front-right curve of the sac. Each impression is a simple shallow closed teardrop-shaped membrane with one tiny central notch, like the physical cadence of one forgotten word. They are not mouths, eyes, letters, runes, symbols, or holes. Keep them separated and arranged along a rising diagonal, never as a face.

Rupture silhouette and action language: the swollen sac occupies roughly two-thirds of the creature’s visible mass. Three dark root-tension bands pull outward from its waist into the four ground struts, as though barely holding the pressure in. One narrow black-violet stress seam runs from the crown toward screen-right and stops before the first ash scar. A small blunt attached spore vent points screen-right but remains secondary. The creature must feel heavy, rooted, and dangerously overfilled, not mobile.

Corruption language: sparse desaturated purple-grey Gloom appears only inside the central stress seam, where the tension bands meet the sac, and on two attached root tips. Use one or two small opaque crusted fungal plates near the embedded marker shard. No detached spores, smoke, mist, aura, floating particles, slime, liquid, translucent material, or glowing cloud.

Production readability: use two major dark value masses plus the three pale pressure scars. Reduce surface microdetail by roughly 45%. Preserve clean negative space between all four root struts and around the marker shard and screen-right vent. Lift ash separation on the three scars, sac crown, vent, and root tips. The swollen orb, marker splinter, and splayed base must read at 72x96; the round overfilled body, diagonal pale scar rhythm, and star-root base must survive at 32x38.

Style/medium: painterly dark-fantasy creature illustration with broad authored brush planes, disciplined game-readable silhouette, twilight-gothic memory horror, and corrupted frontier material weight. Disturbing, sorrowful, tactile, and restrained; not photorealistic or glossy 3D.

Composition/framing: exactly one complete low non-humanoid creature in a neutral rooted 3/4 presentation, canonically oriented toward screen-right. Tall 31:36 source composition with generous clear padding around every edge. Entire sac, marker splinter, vent, scars, root bands, and all four root tips fully separated from the canvas. No dramatic foreshortening, active explosion, or floor interaction. The production master will preserve it at roughly 60–65% of human standee height.

Scene/backdrop: perfectly flat solid #00ff00 chroma-key background for local removal. The background must be one uniform color with no gradient, texture, floor plane, vignette, atmospheric haze, shadow, reflection, or lighting variation. Do not use #00ff00 or similar green anywhere in the Spore.

Lighting/mood: soft top-left key, cool twilight fill, no halo. The taut sac and diagonal ash scars are the decision-relevant focal point but do not glow brightly.

Color palette: peat-black roots, wet-charcoal fungal lobes, muted ash-grey sealed scars, dark weathered wood, sparse #776c91 Gloom seams. No warm focal light, bright mushroom colors, green, or neon.

Constraints: exactly one creature; exactly one swollen sac; exactly four root struts; exactly three sealed ash scar-impressions; exactly one embedded wood splinter; no humanoid or animal anatomy, face, eyes, mouth, teeth, limbs, weapon, carried item, readable text, rune, mushroom cap, exposed organs, blood, scenery, floor, cast/contact shadow, UI, badge, frame, or watermark.

Avoid: ordinary mushroom, toadstool, puffball, flower, pumpkin, seed pod, egg, spider egg sac, insect abdomen, jellyfish, eyeball, mimic, plant turret, tentacle monster, cute mascot, smiling creature, face-like scar layout, literal written word, runes, glowing spots, bioluminescence, purple fog, detached spores, explosion in progress, neon aura, excessive particles, gore, photorealism, glossy 3D, anime, pixel art, or chibi.
```
