# Change Spec: Event decision UX clarity

**Kind:** enhancement  
**Status:** shipped  
**Last updated:** 2026-08-21  
**Decision Register:** `none — enhancement vs accepted contract`  
**Related:** [Interaction Contract](../../ux/interaction-contract.md), [Readability](../../ux/readability.md), [Screens and Flows](../../ux/screens-and-flows.md)

## Summary

The Event (`??` / Unresolved memory) screen currently presents expedition materials and choice consequences in the same visual language, so players cannot tell at a glance what they **already carry** versus what each option **would do**. Restructure the Event view into three distinct regions—**state strip**, **event stage**, **choice stack**—and give each option a fixed Cost → Outcome → Odds layout. Prefer structured choice fields from the sim snapshot over parsing the flat `detail` string. Rest and Craft may share the same visual grammar where they reuse `ChoiceView`, without redesigning Rest/Craft content copy in this pass.

## Authority

Interaction Contract — Event view must show:

> Exact cost, consequence, target, and probability categories for each option; current relevant resources

Interaction Contract — Required information hierarchy / loot:

> Every choice screen distinguishes three ownership states with labels, not color alone: **Carried — at risk** …

Interaction Contract — Acceptance:

> From any screen, a player can identify their current state, the legal next decisions, and the irreversible cost before choosing it.

Interaction Contract — Accessibility:

> Color is never the only carrier of intent … No critical numerical effect exists only in a tooltip.

Supporting presentation guidance after this ship lives in [Readability](../../ux/readability.md) (Event presentation) and [Screens and Flows](../../ux/screens-and-flows.md) (Event row).

## Classification rationale

**Enhancement.** Rules and event outcomes already exist in content and sim; the UI fails to make accepted information hierarchy legible. No new player-facing mechanical rule, no Decision Register row. Client-first; small contracts/sim presentation fields are allowed so Cost / Outcome / Odds are not reverse-engineered from a joined `detail` string.

## Package touch list

- `packages/contracts/` — optional structured fields on `DecisionChoiceSnapshot` (effect lines / outcome bands); keep `detail` for back-compat and confirm dialogs if needed
- `packages/sim/` — `eventChoices` (and craft/rest only if needed for shared typing) populate structured presentation fields; no resolution-rule changes
- `packages/client/` — `ChoiceView` / event layout, `decisionUi.ts` helpers, CSS; compact party peek + relevant-resource filtering; risky confirm reprints Cost/Outcome/Odds
- `packages/fixtures/` or client Vitest — pure helper tests for relevant-resource filter and choice presentation mapping

## Information architecture (normative for this enhancement)

### 1. State strip — “You carry now”

- Labeled **Carried — at risk** (word label, not color alone).
- Always show **Run Gloom** with band name (reuse `gloomPressure`).
- Show **only materials that appear in any option’s cost**, or that the event can grant if already surfaced as relevant; do not dump unused zeros (Wick 0, etc.) unless an option references them.
- Compact party cue: hero names + HP (and Strain/injury if already on the hero snapshot); full loadout remains behind **Party & packs**.
- Visual treatment must **not** match `offer-card` / choice panels (quieter strip, not a competing card grid).

### 2. Event stage — fiction only

- Eyebrow (`Unresolved memory` / category), title from `eventId`, short intro.
- No material counts, no odds lists in this region.
- Optional atmospheric treatment later; Build 1 may keep typography-only stage.

### 3. Choice stack — decisions only

Each option card, top to bottom:

1. Risk badge: Safe / Risky / Dire (word + distinct treatment; color not sole signal)
2. Verb title (`choice.label`)
3. **COST** — from `cost` / `costLabel`; always present (`No cost` when free)
4. **OUTCOME** — guaranteed / deterministic effect lines
5. **ODDS** — weighted bands when present; otherwise `Guaranteed result`
6. Target controls when `needsHeroTarget` / `needsItemTarget` (or keep shared target row above the grid if multiple choices need the same target)
7. Primary **Choose** control; disabled state explains missing cost/target

Do not collapse Cost, Outcome, and Odds into one prose sentence on Event choices.

### 4. Chronicle

**What changed** stays in the way-lantern rail. Do not place recent facts adjacent to options.

### 5. Confirm

Risky/irreversible Event confirm must reprint the same Cost / Outcome / Odds content (inline panel preferred over opaque `window.confirm` when practical; at minimum the confirm text must not drop disclosed bands).

## Acceptance criteria

- [x] On Event view, a player can answer in under five seconds: what I carry that matters; what each option costs; what I gain or risk; which options are Risky vs guaranteed
- [x] State strip is labeled **Carried — at risk** and is visually distinct from choice cards
- [x] Event materials list is filtered to relevant resources (not the full zero-padded materials table)
- [x] Each Event choice shows separate Cost, Outcome, and Odds sections (or explicit Guaranteed)
- [x] Run Gloom in the strip includes band name via existing `gloomPressure` helper
- [x] Compact party HP peek is visible without opening Party & packs
- [x] Risky confirm still discloses outcome range; no gameplay odds change
- [x] Pure helper / mapping tests cover relevant-resource filter and choice presentation split
- [x] `pnpm test` and `pnpm check:boundaries` pass; no `Math.random()` in gameplay; sim purity preserved

## Out of scope

- New events, retuning Choir / other event odds or effects
- Full event vignette art pass
- Redesigning Rest or Craft copy (shared chrome only)
- Replacing Party & packs with a full in-event inventory
- Map / Haven / Combat chrome changes beyond what Event needs
- Moving this hierarchy into the Accepted Interaction Contract body (supporting UX docs carry presentation detail for now)

## Test plan

1. Unit-test `relevantMaterials(run, choices)` (or equivalent): only cost-referenced material ids; empty costs → Gloom/party-only strip still valid.
2. Unit-test presentation mapping from structured choice fields (or from sim-built snapshot): Cost / Outcome / Odds sections populate correctly for `choir_in_the_bark` options (guaranteed resin; 50/50 carve; 40/30/30 voice).
3. Optional client render smoke against a recorded event snapshot if the repo already has UI snapshot fixtures; otherwise helper tests + manual smoke on `pnpm dev` at Event view.
4. `pnpm test` and `pnpm check:boundaries`.
5. Manual smoke: open Choir In The Bark — strip vs cards distinguishable; Party & packs still works; choosing a Risky option still confirms with disclosed bands.

kind: enhancement
