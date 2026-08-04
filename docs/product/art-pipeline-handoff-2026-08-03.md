# Art Pipeline Handoff — 2026-08-03

## Purpose

Hand this document to the next agent before continuing Nightfall art or the limited equipment-layer proof.

## Completed

- The Build 1 item-art pipeline is in place: source/candidate → transparent PNG master → lossless WebP runtime → ID-keyed client registry.
- All 13 Build 1 base vessels have an integrated runtime asset under `packages/client/public/art/items/`.
- `itemArtSrc()` resolves registered WebP assets while unknown item IDs retain the SVG fallback convention.
- The `?artReview=anchors` fixture now lists all 13 items at `128`, `64`, and `32` px. Live review confirmed every image loads as a `512 × 512` WebP.
- Candidate/master sources are stored under `art/masters/items/` and `art/source/candidates/items/`.
- Item-art provenance was reconciled in the manifest. Six streamlined candidates explicitly carry a full-prompt-archive provenance debt; do not invent missing historical prompts.

## Key commits

| Commit | Summary |
|---|---|
| `afac9fc` | Added ID-keyed item-art resolver |
| `1a16e49` | Gloomwood Spear master |
| `1f1fab7` | Aether Rod master |
| `9f639b2` | Cinder Scepter master |
| `830bea2` | Kite Shield master |
| `174247c` | Way-lantern Buckler master |
| `a6f06e8` | Archivist’s Focus master |
| `231a967` | Cracked Way Lens master |
| `df5ba4a` | Pilgrim’s Knot master |
| `faf73d7` | Name-thread Charm master |
| `aad9db7`, `7efd57b` | Emberglass Cowl, Wayfarer’s Coat, Ironweave Gloves, and test fix |
| `b81b5e7` | Full item review fixture |
| `aee63db` | Item provenance cleanup |
| `6aa1884` | Vanguard proof anchors and overlay profiles |
| `d2dac6d` | Vanguard equipment proof fixture |

## Limited equipment-layer proof: current state

The contract limits scope to a Vanguard proof base plus `hewn_sword`, `gloomwood_spear`, and `kite_shield` overlays. See [Technical Asset Contract](../art/technical-asset-contract.md).

Current files:

- Anchor/profile data: `packages/client/src/art/equipmentOverlayProof.ts`
- Profile tests: `packages/client/src/art/equipmentOverlayProof.test.ts`
- Review fixture: `http://localhost:3050/?artReview=equipment`
- Fixture component: `packages/client/src/art/EquipmentOverlayProofReview.tsx`
- Proof source archive: `art/source/proofs/vanguard_equipment/`
- Proof notes: `docs/art/equipment-overlay-proof.md`

The fixture is intentionally isolated from production combat/gameplay. It renders the new proof-only Vanguard base at `86 × 115` and `72 × 96` and switches through the three profiles.

### Do not mark this proof as passed

The current generated overlay assets are visually useful source studies, but their absolute placement is not reliable. The fixture proves the data/compositing seam, not anatomical attachment quality. The current status is **in progress**.

The old production Vanguard standee also has sword and shield baked into it. A neutral proof base was generated separately because the image generator could not surgically remove equipment while preserving the original pose. The new pose is accepted as a proof-specific base only; it has not replaced production hero art.

## Recommended next step: local ComfyUI workflow

Do not continue production art generation through in-chat image generation. Use the other machine's ComfyUI/5080 workflow for iterative, reproducible art and paintovers.

For each approved ComfyUI output, record:

- Asset ID and purpose
- Workflow JSON, model/checkpoint, LoRAs, seed, sampler, and resolution
- Input/reference image paths
- Exact prompt and negative prompt
- Original output path and immutable source image
- Cleanup steps, master/runtime derivatives, and approval

The preferred handoff is a shared folder/network path accessible from this workspace. Otherwise, copy approved source PNGs into the matching repository source folder and let the next agent perform cleanup, runtime conversion, integration, and QA.

For the layer proof, create three dedicated transparent overlay paintings on the shared `992 × 1152` proof canvas:

1. Hewn Sword — grip aligned to Vanguard main hand.
2. Gloomwood Spear — grip partway along the shaft; independent orientation is intentional.
3. Kite Shield — forearm strap aligned to the raised offhand; base hand must draw above the strap.

Keep base inventory art independent. Hand attachment is overlay-profile metadata, not a property of the inventory illustration.

## Remaining backlog

1. Calibrate/replace proof overlays and decide whether the limited layer proof passes.
2. If passed, document the bounded expansion decision; do not add armor/relic/Aether Weaver layering before that gate.
3. Combat playback/VFX timing specification.
4. Core combat VFX and status feedback.
5. Haven/map atmosphere plate.
6. Deferred only if needed: dedicated timeline busts and legendary signature illustrations.

## Verification commands

```powershell
pnpm exec vitest run packages/client/src/art/artMap.test.ts
pnpm exec vitest run packages/client/src/art/equipmentOverlayProof.test.ts
pnpm --filter @nightfall/client build
```

The local review fixture is reachable at `http://localhost:3050/?artReview=equipment` when the client dev server is running.
