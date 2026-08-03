# Way-lantern Buckler Production Candidate

**Date:** 2026-08-03  
**Tool:** Built-in image generation; model identifier is not surfaced  
**Status:** Approved master v1; reviewer approved 2026-08-03

Master: [`art/masters/items/way_lantern_buckler.png`](../../../../masters/items/way_lantern_buckler.png) — transparent `1024 × 1024` PNG.  
Runtime: [`packages/client/public/art/items/way_lantern_buckler.webp`](../../../../../packages/client/public/art/items/way_lantern_buckler.webp) — lossless transparent `512 × 512` WebP.

## QA

- Green field removed with border auto-key, soft matte, thresholds `12/220`, and despill.
- Final alpha bounds `(120, 83)–(903, 941)`; all corners transparent.
- Readability checked at `128`, `64`, and `32` px.

## Exact prompt

```text
Use case: stylized-concept
Asset type: NIGHTFALL production-candidate source for a square game inventory item, Way-lantern Buckler base vessel.

Primary request: Create exactly one compact round Way-lantern Buckler for magical protection. It must read immediately as a round shield at 32 px and be clearly distinct from the tall Kite Shield, a lantern, weapon, or book. Build it from a dented dark-iron round buckler, its rim bound by three uneven copper brackets. In the center, a small recessed smoked-glass Way-lantern aperture is protected behind crossed iron slats; inside is one restrained dim blue-white ember, clearly contained and not a floating flame. Include an old leather hand strap just visible at the lower edge, soot staining around the aperture, a single repaired crack, and tiny vent holes. Credible Salvaged-quality expedition gear—not a magical disc or ceremonial relic.

Scene/backdrop: perfectly flat solid #00ff00 chroma-key background for local background removal. The background must be one uniform color from corner to corner with no shadows, gradients, texture, reflections, floor plane, lighting variation, vignette, or halo. Do not use #00ff00 anywhere in the buckler.

Style/medium: painterly dark-fantasy game item illustration, disciplined simplified value grouping, tactile authored brushwork, bold continuous contour, twilight-gothic and ashen relic-craft language. Practical Salvaged-quality vessel, not rare or legendary. Not photorealistic or glossy 3D.

Composition/framing: exactly one isolated round buckler, centered with a slight diagonal tilt, on a square canvas. Fill roughly 78% of the frame; keep the entire object visible with generous even padding and no perspective foreshortening.

Lighting/mood: soft top-left key, cool neutral fill, and only a small contained blue-white light behind the smoked glass. No cast shadow, contact shadow, reflection, or background spill.

Constraints: one object only; no hand, person, animal, kite shield, weapon, sword, spear, staff, scepter, lantern held separately, book, second object, detached shards, text, UI, crest, badge, watermark, flame plume, fire, aura, particles, smoke, runes, ornate filigree, crown, royal ornament, excessive cyan, neon, halo, pristine ceremonial armor, modern machinery, photorealism, glossy 3D, anime, pixel art, or chibi. No shadow, no extra object.
```
