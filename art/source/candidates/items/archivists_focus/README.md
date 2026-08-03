# Archivist’s Focus Production Candidate

**Date:** 2026-08-03  
**Tool:** Built-in image generation; model identifier is not surfaced  
**Status:** Approved master v1; reviewer approved 2026-08-03

Master: [`art/masters/items/archivists_focus.png`](../../../../masters/items/archivists_focus.png) — transparent `1024 × 1024` PNG.  
Runtime: [`packages/client/public/art/items/archivists_focus.webp`](../../../../../packages/client/public/art/items/archivists_focus.webp) — lossless transparent `512 × 512` WebP.

## QA

- Green field removed with border auto-key, soft matte, thresholds `12/220`, and despill.
- Final alpha bounds `(228, 83)–(795, 941)`; all corners transparent.
- Readability checked at `128`, `64`, and `32` px.

## Exact prompt

```text
Use case: stylized-concept
Asset type: NIGHTFALL production-candidate source for a square game inventory item, Archivist’s Focus base vessel.

Primary request: Create exactly one compact Archivist’s Focus for Aether hand and draw manipulation. It must read immediately as a scholarly handheld focus at 32 px and be clearly distinct from a shield, book, rod, lantern, or weapon. Build it from a soot-dark iron palm frame shaped like an open asymmetric loop, with three short pinned parchment tabs tucked into the frame and one small cracked pale blue-grey lens set in a brass bezel at the upper edge. Add a thin uneven chain, two copper repair stitches, and a worn leather finger loop. The lens holds only a tiny restrained blue-white fracture point; it is not a glowing orb. Credible Salvaged-quality field research tool, not a royal relic.

Scene/backdrop: perfectly flat solid #00ff00 chroma-key background for local background removal. The background must be one uniform color from corner to corner with no shadows, gradients, texture, reflections, floor plane, lighting variation, vignette, or halo. Do not use #00ff00 anywhere in the object.

Style/medium: painterly dark-fantasy game item illustration, disciplined simplified value grouping, tactile authored brushwork, bold continuous contour, twilight-gothic and ashen relic-craft language. Practical Salvaged-quality vessel, not rare or legendary. Not photorealistic or glossy 3D.

Composition/framing: exactly one isolated handheld focus, centered with a slight diagonal tilt, on a square canvas. Fill roughly 75% of the frame; keep the entire object visible with generous even padding and no perspective foreshortening.

Lighting/mood: soft top-left key, cool neutral fill, and only a small contained blue-white fracture in the lens. No cast shadow, contact shadow, reflection, or background spill.

Constraints: one object only; no hand, person, animal, shield, book, rod, staff, weapon, sword, spear, lantern, second object, detached shards, text, readable writing, UI, crest, badge, watermark, fire, aura, particles, smoke, runes, ornate filigree, crown, royal ornament, excessive cyan, neon, halo, pristine ceremonial artifact, modern machinery, photorealism, glossy 3D, anime, pixel art, or chibi. No shadow, no extra object.
```
