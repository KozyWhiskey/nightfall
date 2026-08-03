# Kite Shield Production Candidate

**Date:** 2026-08-03  
**Tool:** Built-in image generation; model identifier is not surfaced  
**Status:** Approved master v1; reviewer approved 2026-08-03

Master: [`art/masters/items/kite_shield.png`](../../../../masters/items/kite_shield.png) — transparent `1024 × 1024` PNG.  
Runtime: [`packages/client/public/art/items/kite_shield.webp`](../../../../../packages/client/public/art/items/kite_shield.webp) — lossless transparent `512 × 512` WebP.

## QA

- Green field removed with border auto-key, soft matte, thresholds `12/220`, and despill.
- Final alpha bounds `(231, 83)–(793, 941)`; transparent corners; no green-dominant visible pixels.
- Readability checked at `128`, `64`, and `32` px.

## Integrity hashes

| File | SHA-256 |
|---|---|
| Selected chroma source | `5E45610FC016D09D9183AE93E1AA95EB3BE7513A9BBB10BFBCB926FB629D3961` |
| Transparent PNG master | `FFB279F75A224796CA185533CF5AA2A3769BD87D15FB7BFFFE82A1B6EC1DE8A8` |
| Runtime lossless WebP | `C1EAE1E7E1EA919DCB54F8D8C9F31781960F55D67DC2BA24E6518D36C2485A75` |

## Exact prompt

```text
Use case: stylized-concept
Asset type: NIGHTFALL production-candidate source for a square game inventory item, Kite Shield base vessel.

Primary request: Create exactly one compact battered Kite Shield for straight protection. It must read immediately as a shield at 32 px and be clearly distinct from a buckler, lantern, weapon, book, or coat. Use a tall medieval kite silhouette with a gently rounded top, broad shoulders, and one simple downward point. Make it a credible Salvaged-quality offhand: dark charcoal-painted wooden face under a dull, uneven iron rim; a small central iron boss; three visible repair plates with mismatched rivets; a diagonal faded ash-grey cloth band or field patch across the face; chipped paint and soot-darkened lower edge. It is practical protection, not heraldic equipment. No magical glow.

Scene/backdrop: perfectly flat solid #00ff00 chroma-key background for local background removal. The background must be one uniform color from corner to corner with no shadows, gradients, texture, reflections, floor plane, lighting variation, vignette, or halo. Do not use #00ff00 anywhere in the shield.

Style/medium: painterly dark-fantasy game item illustration, disciplined simplified value grouping, tactile authored brushwork, bold continuous contour, twilight-gothic and ashen relic-craft language. Practical Salvaged-quality vessel, not a rare or legendary item. Not photorealistic or glossy 3D.

Composition/framing: exactly one isolated kite shield, centered with a slight diagonal tilt, broad upper rim toward upper-right and pointed lower tip toward lower-left, on a square canvas. Fill roughly 78% of the frame; keep the entire object visible with generous even padding and no perspective foreshortening.

Lighting/mood: soft top-left key and cool neutral fill. No cast shadow, contact shadow, reflection, or background spill.

Constraints: one object only; no hand, person, animal, sword, spear, staff, scepter, buckler, lantern, book, second weapon, detached shards, text, letters, UI, crest, heraldry, badge, watermark, fire, aura, particles, smoke, runes, ornate filigree, crown, royal ornament, excessive color, neon, halo, pristine ceremonial armor, modern machinery, photorealism, glossy 3D, anime, pixel art, or chibi. No shadow, no extra object.
```
