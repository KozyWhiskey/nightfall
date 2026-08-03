# Phase A combat art (client presentation)

DOM-only art slots for the combat board. **Art never encodes gameplay rules** — card text, costs, intent labels, and magnitudes remain authoritative. Missing files fall back to CSS silhouettes / text glyphs via `ArtImage`.

Production direction and acceptance criteria live in [`docs/art/`](../../../../docs/art/README.md). This file describes the current runtime seam only.

> **Current implementation:** `src/art/artMap.ts` explicitly maps approved IDs to runtime URLs, so individual assets may use SVG, PNG, or WebP. Unknown IDs retain the SVG convention and graceful fallback. Equipment resolves from its stable base-vessel `definitionId`; affixes do not change the art key.

## Where to drop assets

Serve from Vite `public/` (stable URL = path under this folder):

```text
packages/client/public/art/
  heroes/{classId}.svg|png|webp
  enemies/{definitionId}.svg|png|webp
  entities/{definitionId}.svg|png|webp
  intents/{kind}.svg|png|webp          # attack | defend | buff | special
  items/{baseId}.svg|png|webp           # stash, equipped slot, and inspector
  cards/frame.svg|png|webp             # optional hand-card frame
```

Client resolution lives in `src/art/artMap.ts` (`heroArtSrc`, `enemyArtSrc`, `entityArtSrc`, `intentArtSrc`, `itemArtSrc`, `cardFrameArtSrc`).

## Naming convention (id-keyed)

| Slot | Filename stem | Source id |
|------|---------------|-----------|
| Hero portrait | `heroes/{classId}` | `HeroSnapshot.classId` / combatant `definitionId` for heroes (`vanguard`, `aether_weaver`) |
| Enemy portrait | `enemies/{definitionId}` | Combatant `definitionId` when `kind === "enemy"` |
| Entity portrait | `entities/{definitionId}` | Combatant `definitionId` when `kind === "entity"` (e.g. `smothering_shroud`) |
| Intent glyph | `intents/{kind}` | Presentation kind only: `attack`, `defend`, `buff`, `special` |
| Item illustration | `items/{baseId}` | Equipment `ItemInstance.definitionId`; procedural affixes share the base-vessel image |
| Card frame | `cards/frame` | Optional; all hand cards share one frame |

Use lowercase snake_case ids matching content/sim. The explicit registry supports SVG, PNG, or WebP per asset; changing a runtime format requires updating its registry entry. Keep fixed aspects so layout stays stable:

Open `/?artReview=anchors` on the client dev server to inspect anchor assets at desktop, narrow, timeline, and actual standee-treatment sizes.

- Portraits: ~31∶36 (matches combat silhouette box)
- Intent glyphs: 1∶1
- Card frame: ~12∶10 hand-card face

## Placeholder pack (shipped)

| Path | Role |
|------|------|
| `heroes/vanguard.svg` | Vanguard |
| `heroes/aether_weaver.svg` | Aether Weaver |
| `enemies/gloomfang_hound.svg` | Band-1 |
| `enemies/shattered_husk.svg` | Band-1 |
| `enemies/mire_imp.svg` | Band-1 |
| `enemies/mist_chanter.svg` | Band-1 |
| `enemies/gloom_spore.svg` | Band-1 |
| `enemies/lantern_smother.svg` | Boss |
| `entities/smothering_shroud.svg` | Boss entity |
| `intents/attack.svg` | Intent glyph |
| `intents/defend.svg` | Intent glyph |
| `intents/buff.svg` | Intent glyph |
| `intents/special.svg` | Intent glyph |
| `cards/frame.svg` | Optional hand frame |

## Review candidates

| Path | Role | Status |
|---|---|---|
| `heroes/vanguard.webp` | Rook / Vanguard combat standee | Candidate v1; registry-wired for live standee-state review pending approval |
| `heroes/aether_weaver.webp` | Mara / Aether Weaver combat standee | Candidate v1; registry-wired and technically passed pending approval |
| `enemies/gloomfang_hound.webp` | Gloomfang Hound Band-1 combat standee | Candidate v1; registry-wired for mirrored hostile and live standee-state review pending approval |
| `enemies/shattered_husk.webp` | Shattered Husk Band-1 tank standee | Approved master v1; registry-wired and verified |
| `enemies/mire_imp.webp` | Mire Imp Band-1 disruptor standee | Candidate v1; registry-wired for mirrored hostile and live standee-state review pending approval |
| `enemies/mist_chanter.webp` | Mist Chanter Band-1 support standee | Approved master v1; registry-wired and verified |
| `enemies/gloom_spore.webp` | Gloom Spore Band-1 exploder standee | Approved master v1; registry-wired and verified |
| `enemies/lantern_smother.webp` | Lantern-Smother boss combat standee | Approved master v1; registry-wired and verified |
| `entities/smothering_shroud.webp` | Smothering Shroud boss-mechanic entity | Approved master v1; separately registry-wired and verified |
| `items/hewn_sword.webp` | Hewn Sword base-vessel illustration | Candidate v3; inventory-wired and technically passed pending approval |
| `items/gloomwood_spear.webp` | Gloomwood Spear base-vessel illustration | Approved master v2; registry-wired and fixture-verified |
| `items/aether_rod.webp` | Aether Rod base-vessel illustration | Approved master v1; registry-wired with transparent-master and size QA passed |

Unknown ids (new enemies, future classes, and base vessels without finished art) resolve to a path by convention. If the file is absent, `ArtImage` shows the existing silhouette or item glyph. Layout, names, mechanics, rarity, and eligibility must not depend on the bitmap succeeding.

## Later phases (not implemented here)

- **Phase B — screen atmosphere:** Haven/map/reward chrome, full-bleed mood layers, non-combat portraits. Still DOM; no rule changes.
- **Phase C — canvas VFX:** Optional hit/block/floaters on top of the DOM board; sim/host remain snapshot + commands only.
