import type { CombatantSnapshot } from "@nightfall/contracts";
import { CombatStandee } from "../combat/CombatStandee.js";
import { ArtImage, CombatPortrait } from "./ArtImage.js";
import {
  combatantArtSrc,
  reviewItemArtSrc,
  silhouetteForCombatant,
  silhouetteForHero,
  type CombatantArtKind,
  type SilhouetteVariant
} from "./artMap.js";
import "./artReview.css";

function fixtureCombatant(
  definitionId: string,
  name: string,
  side: "heroes" | "enemies",
  kind: "hero" | "enemy" | "entity",
  hp: number
): CombatantSnapshot {
  return {
    id: `art-review:${definitionId}`,
    definitionId,
    name,
    side,
    kind,
    hp,
    maxHp: hp,
    dex: 0,
    strength: 0,
    intellect: 0,
    initiative: 0,
    itemInitiative: 0,
    blockLayers: [],
    conditions: [],
    burn: [],
    turnsStarted: 0,
    turnsCompleted: 0,
    downed: false,
    destroyed: false,
    nextDamageBonus: 0,
    targetable: true
  };
}

const combatAnchors = [
  fixtureCombatant("vanguard", "Rook", "heroes", "hero", 34),
  fixtureCombatant("gloomfang_hound", "Gloomfang Hound", "enemies", "enemy", 20),
  fixtureCombatant("lantern_smother", "Lantern-Smother", "enemies", "enemy", 110),
  fixtureCombatant("smothering_shroud", "Smothering Shroud", "enemies", "entity", 18)
] as const;

function artKind(combatant: CombatantSnapshot): CombatantArtKind {
  if (combatant.side === "heroes") return "hero";
  return combatant.kind === "entity" ? "entity" : "enemy";
}

function silhouette(combatant: CombatantSnapshot): SilhouetteVariant {
  return combatant.side === "heroes"
    ? silhouetteForHero(combatant.definitionId)
    : silhouetteForCombatant(combatant.kind === "entity" ? "entity" : "enemy");
}

function ReviewPortrait({ combatant, size }: { combatant: CombatantSnapshot; size: "desktop" | "narrow" | "timeline" }) {
  return <div className={`art-review-swatch is-${size}`}>
    <CombatPortrait
      src={combatantArtSrc(artKind(combatant), combatant.definitionId)}
      variant={silhouette(combatant)}
      facing={combatant.side === "enemies" ? "left" : "right"}
    />
  </div>;
}

export function AnchorArtReview() {
  const vanguard = combatAnchors[0];
  return <main className="art-review-page">
    <header className="art-review-header">
      <div>
        <span>Development fixture · ?artReview=anchors</span>
        <h1>Anchor art contact sheet</h1>
      </div>
      <p>Review transparent masters against both Nightfall field colors. Source art is canonically right-facing; hostile presentation is mirrored here.</p>
    </header>

    <section className="art-review-section">
      <h2>Runtime sizes and orientation</h2>
      <div className="art-review-anchor-grid">
        {combatAnchors.map((combatant) => <article className="art-review-anchor" key={combatant.definitionId}>
          <div className="art-review-anchor-title"><strong>{combatant.name}</strong><code>{combatant.definitionId}</code></div>
          <div className="art-review-size-row">
            <div><ReviewPortrait combatant={combatant} size="desktop" /><small>86 × 115</small></div>
            <div><ReviewPortrait combatant={combatant} size="narrow" /><small>72 × 96</small></div>
            <div><ReviewPortrait combatant={combatant} size="timeline" /><small>32 × 38</small></div>
          </div>
        </article>)}
      </div>
    </section>

    <section className="art-review-section">
      <h2>Actual standee treatments</h2>
      <div className="art-review-state-grid">
        {([
          { label: "Neutral", active: false, acting: false, targetable: false, downed: false, linked: false },
          { label: "Active", active: true, acting: false, targetable: false, downed: false, linked: false },
          { label: "Targetable", active: false, acting: false, targetable: true, downed: false, linked: false },
          { label: "Acting", active: false, acting: true, targetable: false, downed: false, linked: false },
          { label: "Downed", active: false, acting: false, targetable: false, downed: true, linked: false },
          { label: "Linked", active: false, acting: false, targetable: false, downed: false, linked: true }
        ] as const).map((state) => {
          const combatant = { ...vanguard, downed: state.downed };
          return <div className="art-review-state" key={state.label}>
            <small>{state.label}</small>
            <CombatStandee
              combatant={combatant}
              side="heroes"
              classLabel="Vanguard"
              isActive={state.active}
              isActing={state.acting}
              actingIntentLabel={state.acting ? "Iron Cut" : undefined}
              canTarget={state.targetable}
              targetable={!state.downed}
              block={0}
              conditions={[]}
              resources={{ ap: 3, mana: 3, stamina: 10 }}
              maxMana={3}
              maxStamina={10}
              queueLabel={state.linked ? "2nd in queue" : undefined}
              isLinked={state.linked}
            />
          </div>;
        })}
      </div>
    </section>

    <section className="art-review-section">
      <h2>Item anchor</h2>
      <article className="art-review-item">
        <ArtImage
          src={reviewItemArtSrc("hewn_sword")}
          className="art-review-item-image"
          alt=""
          fallback={<div className="art-review-missing"><strong>Hewn Sword</strong><span>Awaiting candidate WebP</span></div>}
        />
        <div><strong>Hewn Sword</strong><code>hewn_sword</code><p>Review at 128, 64, and 32 px after the first candidate is installed.</p></div>
      </article>
    </section>

    <footer className="art-review-footer">This fixture is presentation-only and does not load or mutate game state.</footer>
  </main>;
}
