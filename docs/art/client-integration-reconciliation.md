# Client Art Integration Reconciliation

**Status:** Complete for Build 1 — `ART-01` through `ART-05` implemented
**Last updated:** 2026-08-03
**Related:** [Combat Art Runtime Notes](../../packages/client/public/art/README.md), [Technical Asset Contract](technical-asset-contract.md)

## Current state

The client has a robust fallback-first presentation seam and an explicit registry serving the Build 1 combat-standee and base-vessel libraries. The remaining hero equipment-overlay work is explicitly deferred beyond Build 1.

| Gap | Status | Consequence / next decision |
|---|---|---|
| Mixed SVG/PNG/WebP paths | Resolved by explicit registry | Each approved ID can select its runtime format without changing content identity |
| Inconsistent hostile orientation | Resolved by semantic facing | The same canonical right-facing source is mirrored in battlefield and timeline contexts |
| Full-body art is reused at timeline size | Resolved by lineup audit | All nine combat standees remain recognizable at `32 × 38`; reuse full standees and do not commission bust crops for Build 1 |
| Item UI uses slot-category glyphs | Resolved by `ART-04` | Equipment requests art by stable base-vessel ID in stash, equipped slot, and inspector; missing art keeps the existing glyph |
| Hero art resolves only from `classId` | Explicitly deferred | Equipment overlays remain outside Build 1 until the bounded proof passes |

These are presentation gaps, not simulation or content defects.

## Recommended implementation order

### ART-01 — Explicit mixed-format art registry — implemented

Replace extension construction with an explicit presentation registry mapping stable IDs to runtime URLs. Keep convention fallback for unknown future IDs, but do not rely on repeated 404 probing to discover formats.

Acceptance:

- Existing SVG placeholders continue to load.
- A transparent PNG or WebP candidate can be selected per ID.
- Missing assets retain the current CSS/text fallback.
- No gameplay package imports presentation assets.

### ART-02 — Semantic orientation — implemented

Pass combatant side/orientation to the portrait component and apply mirroring consistently in battlefield and initiative contexts. Store all standee masters facing screen-right.

Acceptance:

- Heroes display facing right.
- Enemies and hostile entities display facing left in both battlefield and timeline.
- Inventory hero portraits are not mirrored.
- Accessible names and hit areas are unaffected.

### ART-03 — Anchor contact-sheet fixture — implemented

The deterministic review surface is available at `/?artReview=anchors`. It renders all nine Build 1 combat standees in exact review swatches plus the real standee state treatments. This is visual QA, not combat correctness testing.

Acceptance:

- The required contract sizes can be captured consistently.
- Active, targetable, acting, downed, and linked treatments remain legible.
- Art failure still produces the intended fallback without layout shift.

### ART-04 — ID-keyed item art with glyph fallback — implemented

`ItemGlyph` now requests art from `ItemInstance.definitionId`, the stable base-vessel ID, through `itemArtSrc`. The existing slot glyph remains the failure fallback, while text, rarity, mechanics, and eligibility remain authoritative UI. Procedural affixes continue to share their base-vessel illustration.

The isolated live-client check exercised Hewn Sword in equipped-slot, Haven-held, and inspector contexts. Its `512 × 512` runtime WebP decoded at each size without overflow. Kite Shield, which has no runtime illustration yet, fell back to its offhand glyph with its name and mechanics intact.

Acceptance:

- All 13 Build 1 base vessel IDs can resolve independently.
- Procedural affixes do not require unique raster files.
- A missing item image shows the current glyph without losing its name or mechanics.
- The same base vessel remains recognizable in stash, equipped slot, and inspector contexts.

### ART-05 — Timeline crop decision — implemented

The full nine-standee fixture and [Band-1 lineup audit](band-1-lineup-audit.md) pass at `32 × 38`. Build 1 reuses the full standees in the initiative tracker. Dedicated bust assets and focal metadata remain unnecessary unless a later art revision fails the same contract check.

## Explicitly deferred

- Runtime equipment-layer compositing.
- Armor occlusion masks and per-loadout render graphs.
- Affix-specific generated art.
- Canvas combat rendering.
- VFX that imply or calculate game outcomes.

## Handoff gate before anchor generation

Anchor generation may begin once:

- The canonical screen-right authoring convention is accepted.
- The four anchor briefs are derived from canonical content.
- A temporary review location is chosen outside runtime `public/art` paths.
- The contact-sheet background and target sizes are prepared.

Production integration should begin only after an anchor candidate passes review. This keeps exploratory output from silently replacing dependable placeholders.
