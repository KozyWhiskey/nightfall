# Roadside Trail combat UX smoke

Not a rules test. Confirm the player can see the interaction-contract combat hierarchy.

## Setup

1. `pnpm dev` (Vite `3050`, host `3051`).
2. Open `http://127.0.0.1:3050` (LAN: `http://192.168.68.71:3050`).
3. Name Haven if prompted, Embark, travel `edge_01` into Roadside Trail.

## Must be visible without opening a tooltip

- Current actor
- AP
- HP, Mana, Stamina
- Card costs
- Initiative timeline
- Next enemy intents
- Basics (Attack / Block)
- Draw / discard / exhaust counts

## Guard / Block readability

If Hold the Line is played, the timeline or standees should make the Guard window legible. If it is not, record an enhancement spec — do not invent client-side rules.

## Evidence

Save a screenshot and a short note in `docs/specs/evidence/` with seed (`NIGHTFALL_SEED` if set), content hash from `/api/health`, and pass/fail vs this checklist.
