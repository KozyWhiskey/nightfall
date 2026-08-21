# Readability

**Status:** Supporting presentation guidance
**Last updated:** 2026-08-20

**Build 1 authority:** [Interaction Contract](interaction-contract.md) owns required information and accessibility rules. This document supplies additional visual guidance only.

## Goal

Combat puzzles only work if information is honest and scannable — especially with 2–3 heroes and co-op spectators. Event and other choice screens use the same honesty bar: current state and prospective decisions must never share one undifferentiated visual language.

## Non-negotiables

1. **Initiative timeline** always visible during combat; updates when order changes.
2. **Enemy intents** shown before the enemy acts (icon + magnitude when known).
3. **AP, Stamina, and Mana** per active hero always visible.
4. **Card costs** (which pools) and downside tags (curse, exhaust, self-hit) visible on the card face.
5. **Craft risk tier** (Safe / Risky / Dire) shown before confirmation.
6. **Torch count** visible in Haven and on run results.
7. **Gloom meter** visible on map/Haven; rises/falls should be attributable (why it moved).
8. **Event / choice screens** separate **state** (what you carry now) from **decisions** (what each option costs and may do). See [Event presentation](#event-presentation).

## Event presentation

Tone: Darkest Dungeon dread in framing; Slay the Spire clarity in layout. Atmosphere belongs on the **stage**; clinical disclosure belongs on the **choice stack**.

| Region | Job | Must not |
|--------|-----|----------|
| **State strip** | Current relevant resources, Run Gloom + band, compact party HP; labeled **Carried — at risk** | Look like an offer/choice card; dump every material at 0 |
| **Event stage** | Category, title, short fiction | Inventory counts, odds tables |
| **Choice stack** | Verb options with **Cost → Outcome → Odds** (or Guaranteed) | One prose sentence that mixes spend, gain, and probability |
| **Way-lantern facts** | Recent chronicle (**What changed**) | Sit beside options as if it were a fourth choice |

Choice-card stack order (Event):

1. Risk badge (Safe / Risky / Dire — word + treatment; color not sole signal)
2. Verb title
3. **COST** (always present; `No cost` when free)
4. **OUTCOME** (deterministic / guaranteed effect lines)
5. **ODDS** (weighted bands, or explicit Guaranteed)
6. Target pickers when required
7. Choose control; disabled reasons stay on-card

Prefer structured snapshot fields for Cost / Outcome / Odds over parsing a joined `detail` string. Outcome lines should use player-facing flag/odds wording; the state strip includes materials an option spends **or** grants. Shipped layout: [Event decision UX clarity](../specs/shipped/event-decision-ux-clarity.md). Disclosure polish: [Event disclosure polish](../specs/shipped/event-disclosure-polish.md).

Cognitive test: a new player answers in under five seconds, without Party & packs — (1) what I have that this event might spend, (2) each option’s cost, (3) what I am gambling, (4) which options are safe vs risky.

## Deck clarity

- When gear injects a card, equip/unequip feedback shows “+Dodge added to deck.”
- Hand, draw count, discard count available without opening a wiki overlay.

## Co-op clarity

- Whose turn is unambiguous (active hero + owning player).
- **Ally hands visible** to teammates (full faces) for cooperative puzzling.

## Accessibility (friends-hosted bar)

- Color not the sole signal (intents use shape + label).
- Scalable UI text where reasonable.
- Full a11y audit is nice-later, not a blocker for private host.

## Vertical-slice presentation bar

Prioritize crisp, readable UI and intentional dark tone. Placeholder character/enemy art is acceptable if typography, color, icons, copy, and state feedback make combat and Haven decisions legible.

## Acceptance criteria

- [ ] A spectator can explain the board state mid-fight
- [ ] No critical number exists only in a tooltip
- [ ] On an Event screen, state strip and choice cards are distinguishable without reading body copy twice
- [ ] Event options disclose Cost, Outcome, and Odds as separate blocks (or explicit Guaranteed)
