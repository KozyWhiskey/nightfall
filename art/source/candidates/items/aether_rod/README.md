# Aether Rod Production Candidate

**Date:** 2026-08-03
**Tool:** Built-in image generation; model identifier is not surfaced by the built-in tool
**Status:** Approved master v1; technical QA passed, reviewer approved 2026-08-03

## Files

| File | Role | Judgment |
|---|---|---|
| `aether_rod_candidate_chroma_v1.png` | Generated chroma source | Selected source |
| `aether_rod_candidate_alpha_v1.png` | Cleaned alpha source | Selected cleanup source |
| `aether_rod_candidate_normalized_v1.png` | Normalized transparent master comparison | Selected normalization source |
| `aether_rod_candidate_runtime_v1.webp` | Runtime comparison derivative | Selected runtime source |
| `aether_rod_candidate_qa_v1.png` | Alpha, field-color, size, and grayscale sheet | Passed technical and visual review |

Master: [`art/masters/items/aether_rod.png`](../../../../masters/items/aether_rod.png) — transparent `1024 × 1024` PNG.

Runtime review derivative: [`packages/client/public/art/items/aether_rod.webp`](../../../../../packages/client/public/art/items/aether_rod.webp) — lossless transparent `512 × 512` WebP.

## Post-processing record

- Removed the generated green field with the installed `remove_chroma_key.py` helper using border auto-key, soft matte, thresholds `12/220`, and despill.
- Detected key color: `#03f905`.
- Extraction: `1,228,123 / 1,572,516` transparent pixels and `6,134` partially transparent pixels.
- Cropped to nonzero alpha bounds, normalized the longest visible extent to `858 px`, and centered the result on the required `1024 × 1024` transparent master canvas.
- Final alpha bounds: `(118, 83)–(906, 941)`; occupancy `77.0% × 83.8%`; all four corner alpha values are `0`.
- Created the runtime derivative at `512 × 512` as lossless WebP.
- Verified the selected master at `128 × 128`, `64 × 64`, and `32 × 32` in color and grayscale. The broken containment ring and cracked crystal remain distinct at the smallest size.
- Automated fringe scan found no green-dominant visible pixels in the selected alpha source, master, or runtime derivative.

## Integrity hashes

| File | SHA-256 |
|---|---|
| Selected chroma source | `D6658914362E51157B445B8FE3D7338C21463E1ED547613A203E5DAFF1470548` |
| Transparent PNG master | `4045C8BBA2F6420D765BE8A84785E76D7BC6AEC0DCD58FC65626C56094F60563` |
| Runtime lossless WebP | `93ADD618AAA2FDB4BD6BD855EA5208463BE1CE17F7FCF0F1DA4E1E8EEADB73CE` |

## Exact prompt

```text
Use case: stylized-concept
Asset type: NIGHTFALL production-candidate source for a square game inventory item, Aether Rod base vessel.

Primary request: Create exactly one compact one-handed Aether Rod, a practical catalyst for unstable Weave channeling. It must read immediately as a short rod at 32 px and be clearly distinct from a spear, staff, scepter, or sword. Build it from a soot-dark iron central spine and a short worn leather grip, with a chunky cracked pale blue-grey crystal seated at the upper end inside an interrupted iron ring. The ring is visibly broken in one place and tied across the gap with a single thin asymmetric chain. Two tiny hammered-copper repairs hold the crystal housing together. Inside the crystal show only two restrained pale blue-white fracture seams, with no bloom beyond the object. The lower end has a blunt iron cap, not a spear butt.

Scene/backdrop: perfectly flat solid #00ff00 chroma-key background for local background removal. The background must be one uniform color from corner to corner with no shadows, gradients, texture, reflections, floor plane, lighting variation, vignette, or halo. Do not use #00ff00 anywhere in the rod.

Style/medium: painterly dark-fantasy game item illustration, disciplined simplified value grouping, tactile authored brushwork, bold continuous contour, twilight-gothic and ashen relic-craft language. Practical Salvaged-quality vessel, not a rare or legendary weapon. Not photorealistic or glossy 3D.

Composition/framing: exactly one isolated short rod, centered diagonally from lower-left grip to upper-right crystal head on a square canvas. Fill roughly 78% of the frame; keep the entire object visible with generous even padding and no perspective foreshortening.

Lighting/mood: soft top-left key, cool neutral fill, and only the faint contained Aether light inside the two crystal fractures. No cast shadow, contact shadow, reflection, or background spill.

Constraints: one object only; no hand, person, animal, staff, spear, scepter, sword, shield, book, second weapon, detached shards, text, UI, rarity gem, badge, watermark, fire, aura, particles, smoke, runes, ornate filigree, excessive cyan, neon, lightning bolts, floating crystals, halo, pristine royal weapon, modern machinery, photorealism, glossy 3D, anime, pixel art, or chibi. No shadow, no extra object.
```
