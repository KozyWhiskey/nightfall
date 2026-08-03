import type { CombatantSnapshot } from "@nightfall/contracts";
import { CombatStandee } from "../combat/CombatStandee.js";
import { ArtImage, CombatPortrait } from "./ArtImage.js";
import {
  combatantArtSrc,
  itemArtSrc,
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
  fixtureCombatant("aether_weaver", "Mara", "heroes", "hero", 24),
  fixtureCombatant("gloomfang_hound", "Gloomfang Hound", "enemies", "enemy", 20),
  fixtureCombatant("shattered_husk", "Shattered Husk", "enemies", "enemy", 30),
  fixtureCombatant("mire_imp", "Mire Imp", "enemies", "enemy", 16),
  fixtureCombatant("mist_chanter", "Mist Chanter", "enemies", "enemy", 22),
  fixtureCombatant("gloom_spore", "Gloom Spore", "enemies", "enemy", 14),
  fixtureCombatant("lantern_smother", "Lantern-Smother", "enemies", "enemy", 110),
  fixtureCombatant("smothering_shroud", "Smothering Shroud", "enemies", "entity", 18)
] as const;

const itemAnchors = [
  { definitionId: "hewn_sword", name: "Hewn Sword", detail: "Candidate v3: inventory-wired and technically passed; reviewer approval remains pending." },
  { definitionId: "gloomwood_spear", name: "Gloomwood Spear", detail: "Approved master v2: registry-wired and fixture-verified." },
  { definitionId: "aether_rod", name: "Aether Rod", detail: "Approved master v1: registry-wired with transparent-master and size QA passed." },
  { definitionId: "cinder_scepter", name: "Cinder Scepter", detail: "Approved master v1: registry-wired with transparent-master and size QA passed." },
  { definitionId: "kite_shield", name: "Kite Shield", detail: "Approved master v1: registry-wired with transparent-master and size QA passed." },
  { definitionId: "way_lantern_buckler", name: "Way-lantern Buckler", detail: "Approved master v1: registry-wired with transparent-master and size QA passed." },
  { definitionId: "archivists_focus", name: "Archivist’s Focus", detail: "Approved master v1: registry-wired with transparent-master and size QA passed." },
  { definitionId: "cracked_way_lens", name: "Cracked Way Lens", detail: "Approved master v1: registry-wired with transparent-master and size QA passed." },
  { definitionId: "pilgrims_knot", name: "Pilgrim’s Knot", detail: "Approved master v1: registry-wired with transparent-master and size QA passed." },
  { definitionId: "name_thread_charm", name: "Name-thread Charm", detail: "Approved master v1: registry-wired with transparent-master and size QA passed." },
  { definitionId: "emberglass_cowl", name: "Emberglass Cowl", detail: "Approved master v1: registry-wired with transparent-master and size QA passed." },
  { definitionId: "wayfarers_coat", name: "Wayfarer’s Coat", detail: "Approved master v1: registry-wired with transparent-master and size QA passed." },
  { definitionId: "ironweave_gloves", name: "Ironweave Gloves", detail: "Approved master v1: registry-wired with transparent-master and size QA passed." }
] as const;

const reviewStates = [
  { label: "Neutral", active: false, acting: false, targetable: false, downed: false, linked: false },
  { label: "Active", active: true, acting: false, targetable: false, downed: false, linked: false },
  { label: "Targetable", active: false, acting: false, targetable: true, downed: false, linked: false },
  { label: "Acting", active: false, acting: true, targetable: false, downed: false, linked: false },
  { label: "Downed", active: false, acting: false, targetable: false, downed: true, linked: false },
  { label: "Linked", active: false, acting: false, targetable: false, downed: false, linked: true }
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

function StandeeStateReview({ combatant }: { combatant: CombatantSnapshot }) {
  const isWeaver = combatant.definitionId === "aether_weaver";
  const isEnemy = combatant.side === "enemies";
  const classLabel = combatant.definitionId === "lantern_smother"
    ? "Boss"
    : combatant.kind === "entity"
      ? "Boss Entity"
      : isEnemy
        ? "Band 1"
        : isWeaver
          ? "Aether Weaver"
          : "Vanguard";
  const actingIntentLabel = combatant.definitionId === "lantern_smother"
    ? "Smother Lantern"
    : combatant.kind === "entity"
      ? "Constrict"
      : combatant.definitionId === "shattered_husk"
        ? "Mourning Blow"
      : combatant.definitionId === "mire_imp"
        ? "Whisper Bolt"
      : combatant.definitionId === "mist_chanter"
        ? "Dirge"
      : combatant.definitionId === "gloom_spore"
        ? "Swell"
      : isEnemy
        ? "Maul"
        : isWeaver
          ? "Aether Bolt"
          : "Iron Cut";
  return <div className="art-review-state-set">
    <h3>{combatant.name} · {classLabel}</h3>
    <div className="art-review-state-grid">
      {reviewStates.map((state) => {
        const stateCombatant = { ...combatant, downed: state.downed };
        return <div className="art-review-state" key={state.label}>
          <small>{state.label}</small>
          <CombatStandee
            combatant={stateCombatant}
            side={combatant.side}
            classLabel={classLabel}
            isActive={state.active}
            isActing={state.acting}
            actingIntentLabel={state.acting ? actingIntentLabel : undefined}
            canTarget={state.targetable}
            targetable={!state.downed}
            block={0}
            conditions={[]}
            resources={isEnemy ? undefined : { ap: 3, mana: isWeaver ? 6 : 3, stamina: isWeaver ? 2 : 10 }}
            maxMana={isEnemy ? undefined : isWeaver ? 6 : 3}
            maxStamina={isEnemy ? undefined : isWeaver ? 2 : 10}
            queueLabel={state.linked ? "2nd in queue" : undefined}
            isLinked={state.linked}
          />
        </div>;
      })}
    </div>
  </div>;
}

export function AnchorArtReview() {
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
      {combatAnchors.map((combatant) =>
        <StandeeStateReview combatant={combatant} key={combatant.definitionId} />
      )}
    </section>

    <section className="art-review-section">
      <h2>Item anchors</h2>
      {itemAnchors.map((item) => <article className="art-review-item" key={item.definitionId}>
        <div className="art-review-item-sizes">
          {([128, 64, 32] as const).map((size) => <div key={size}>
            <div className={`art-review-item-swatch is-size-${size}`}>
              <ArtImage
                src={itemArtSrc(item.definitionId)}
                className="art-review-item-image"
                alt=""
                fallback={<div className="art-review-missing"><span>Missing</span></div>}
              />
            </div>
            <small>{size} × {size}</small>
          </div>)}
        </div>
        <div><strong>{item.name}</strong><code>{item.definitionId}</code><p>{item.detail}</p></div>
      </article>)}
    </section>

    <footer className="art-review-footer">This fixture is presentation-only and does not load or mutate game state.</footer>
  </main>;
}
