import { useEffect, useMemo, useRef } from "react";
import type { CombatSnapshot, CombatantSnapshot, EnemyIntentSnapshot } from "@nightfall/contracts";
import { CombatPortrait, IntentGlyph } from "../art/ArtImage.js";
import { combatantArtSrc, intentArtSrc, silhouetteForCombatant, silhouetteForHero } from "../art/artMap.js";
import {
  defenseCoverageWindows,
  enemyDefenseCoverageText,
  enemyIdsBeforeNextHero,
  heroDefenseCoverageText,
  initiativeQueueLabels,
  intentGlyphChar,
  intentKind,
  intentSummary,
  isTimelineCombatant,
  queueOrdinal,
  rotatedInitiativeOrder
} from "./combatUi.js";
import { isMarkedCarrier } from "./carrierChaseUi.js";

function portraitFor(combatant: CombatantSnapshot) {
  if (combatant.side === "heroes") {
    return {
      src: combatantArtSrc("hero", combatant.definitionId),
      variant: silhouetteForHero(combatant.definitionId)
    };
  }
  const kind = combatant.kind === "entity" ? "entity" : "enemy";
  return {
    src: combatantArtSrc(kind, combatant.definitionId),
    variant: silhouetteForCombatant(kind)
  };
}

function TrackerRow({
  combatant,
  intent,
  queueIndex,
  queueLabel,
  coverageLabel,
  isNow,
  isNext,
  isPlaybackFocus,
  isLinked,
  isCarrier,
  actsBeforeHero,
  onLink
}: {
  combatant: CombatantSnapshot;
  intent: EnemyIntentSnapshot | undefined;
  queueIndex: number;
  queueLabel?: string;
  coverageLabel?: string;
  isNow: boolean;
  isNext: boolean;
  isPlaybackFocus: boolean;
  isLinked: boolean;
  isCarrier: boolean;
  actsBeforeHero: boolean;
  onLink: (combatantId: string | null) => void;
}) {
  const portrait = portraitFor(combatant);
  const kind = intent !== undefined ? intentKind(intent) : undefined;
  const rowRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    if (!isLinked || rowRef.current === null) return;
    rowRef.current.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [isLinked]);

  return <li
    ref={rowRef}
    className={[
      "initiative-row",
      combatant.side === "enemies" ? "is-enemy" : "is-hero",
      isNow ? "is-now" : "",
      isNext ? "is-next" : "",
      isPlaybackFocus ? "is-playback-focus" : "",
      actsBeforeHero ? "is-imminent" : "",
      isLinked ? "is-linked" : "",
      isCarrier ? "is-carrier" : ""
    ].filter(Boolean).join(" ")}
    data-combatant-id={combatant.id}
    onMouseEnter={() => onLink(combatant.id)}
    onMouseLeave={() => onLink(null)}
  >
    <span className="initiative-queue-badge" aria-hidden="true">{queueIndex + 1}</span>
    <div className="initiative-portrait">
      <CombatPortrait
        src={portrait.src}
        variant={portrait.variant}
        facing={combatant.side === "enemies" ? "left" : "right"}
      />
    </div>
    <div className="initiative-copy">
      <strong>{combatant.name}</strong>
      {isCarrier && <span className="initiative-carrier-badge">Carrier</span>}
      <span className="initiative-value" title="Initiative">Init {combatant.initiative}</span>
      {queueLabel !== undefined && <span className="initiative-queue-label">{queueLabel}</span>}
      {actsBeforeHero && <span className="initiative-imminent-label">Before your turn</span>}
      {intent !== undefined && kind !== undefined ? <span className={`initiative-intent intent-${kind}`}>
        <IntentGlyph src={intentArtSrc(kind)} textFallback={intentGlyphChar(kind)} />
        {intentSummary(intent)}
      </span> : combatant.side === "heroes"
        ? <span className="initiative-intent is-hero-turn">Hero turn</span>
        : <span className="initiative-intent is-muted">—</span>}
      {coverageLabel !== undefined && <span className="initiative-queue-label" title={coverageLabel}>{coverageLabel}</span>}
    </div>
    {isNow && <span className="initiative-now-label">Now</span>}
    {isLinked && !isNow && <span className="initiative-link-label">{queueOrdinal(queueIndex)}</span>}
  </li>;
}

export function InitiativeTracker({
  combat,
  playbackFocusId,
  linkedCombatantId,
  onLinkCombatant
}: {
  combat: CombatSnapshot;
  playbackFocusId: string | null;
  linkedCombatantId: string | null;
  onLinkCombatant: (combatantId: string | null) => void;
}) {
  const order = rotatedInitiativeOrder(combat);
  const focusId = playbackFocusId ?? combat.activeCombatantId;
  const queueLabels = useMemo(() => initiativeQueueLabels(combat), [combat]);
  const coverageLabels = useMemo(() => {
    const windows = defenseCoverageWindows(combat);
    const labels = new Map<string, string>();
    for (const window of windows) {
      const heroText = heroDefenseCoverageText(window);
      if (heroText !== undefined) labels.set(window.heroId, heroText);
    }
    for (const id of order) {
      const enemyText = enemyDefenseCoverageText(windows, id);
      if (enemyText !== undefined) labels.set(id, enemyText);
    }
    return labels;
  }, [combat, order]);
  const imminentIds = useMemo(() => enemyIdsBeforeNextHero(combat), [combat]);

  return <aside className={`initiative-tracker${linkedCombatantId !== null ? " has-linked-row" : ""}`} aria-label="Initiative order">
    <header className="initiative-tracker-head">
      <h2>Turn order</h2>
      <p>Round {combat.round}</p>
    </header>
    <ol className="initiative-list">
      {order.map((id, index) => {
        const combatant = combat.combatants.find((entry) => entry.id === id);
        if (combatant === undefined || !isTimelineCombatant(combatant)) return null;
        const intent = combat.intents.find((entry) => entry.enemyId === id);
        const isNow = id === focusId;
        const isNext = index === 1;
        return <TrackerRow
          key={id}
          combatant={combatant}
          intent={intent}
          queueIndex={index}
          queueLabel={queueLabels.get(id)}
          coverageLabel={coverageLabels.get(id)}
          isNow={isNow}
          isNext={isNow ? false : isNext}
          isPlaybackFocus={playbackFocusId !== null && id === playbackFocusId}
          isLinked={id === linkedCombatantId}
          isCarrier={isMarkedCarrier(combatant)}
          actsBeforeHero={imminentIds.has(id)}
          onLink={onLinkCombatant}
        />;
      })}
    </ol>
  </aside>;
}
