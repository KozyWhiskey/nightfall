import { useId, useState } from "react";
import type { CombatantSnapshot, EnemyIntentSnapshot } from "@nightfall/contracts";
import { CombatPortrait } from "../art/ArtImage.js";
import { combatantArtSrc, silhouetteForCombatant, silhouetteForHero } from "../art/artMap.js";
import { titleCase } from "../decisionUi.js";
import { burnStackCount, conditionTooltip } from "./combatUi.js";

function CompactMeter({ label, value, max, tone }: { label: string; value: number; max: number; tone: string }) {
  const pct = max === 0 ? 0 : Math.max(0, Math.min(100, value / max * 100));
  return <div className="compact-meter" title={`${label} ${value}/${max}`}>
    <span>{label}</span>
    <div className="compact-meter-track" aria-hidden="true"><i className={tone} style={{ width: `${pct}%` }} /></div>
    <strong>{value}</strong>
  </div>;
}

export function CombatStandee({
  combatant,
  side,
  classLabel,
  isActive,
  isActing,
  actingIntentLabel,
  canTarget,
  targetable,
  block,
  conditions,
  injuries,
  resources,
  maxMana,
  maxStamina,
  carrierNote,
  guardLabels,
  queueLabel,
  isLinked,
  onActivate,
  onLink
}: {
  combatant: CombatantSnapshot;
  side: "heroes" | "enemies";
  classLabel: string;
  isActive: boolean;
  isActing: boolean;
  actingIntentLabel?: string;
  canTarget: boolean;
  targetable: boolean;
  block: number;
  conditions: readonly { id: string }[];
  injuries?: readonly string[];
  resources?: { ap: number; mana: number; stamina: number };
  maxMana?: number;
  maxStamina?: number;
  carrierNote?: string;
  guardLabels?: readonly string[];
  queueLabel?: string;
  isLinked: boolean;
  onActivate?: () => void;
  onLink?: (combatantId: string | null) => void;
}) {
  const burnStacks = burnStackCount(combatant.burn);
  const panelId = useId();
  const [hovered, setHovered] = useState(false);
  const highlighted = hovered || isLinked || isActive || isActing;
  const portraitKind = combatant.kind === "entity" ? "entity" : side === "heroes" ? "hero" : "enemy";
  const silhouette = side === "heroes"
    ? silhouetteForHero(combatant.definitionId)
    : silhouetteForCombatant(combatant.kind === "entity" ? "entity" : "enemy");
  const Tag = canTarget ? "button" : "div";
  const downed = combatant.downed;

  return <div
    className={`combat-standee combat-standee-${side}${downed ? " is-downed" : ""}${isActive ? " is-active" : ""}${isActing ? " is-acting" : ""}${isLinked ? " is-linked" : ""}${canTarget ? " is-targetable" : ""}`}
    onMouseEnter={() => {
      setHovered(true);
      onLink?.(combatant.id);
    }}
    onMouseLeave={() => {
      setHovered(false);
      onLink?.(null);
    }}
  >
    <Tag
      type={canTarget ? "button" : undefined}
      className="standee-figure"
      aria-label={canTarget ? `Target ${combatant.name}` : `${combatant.name} on the field`}
      aria-describedby={panelId}
      disabled={canTarget && !targetable}
      onClick={canTarget ? onActivate : undefined}
    >
      <CombatPortrait
        src={combatantArtSrc(portraitKind, combatant.definitionId)}
        variant={silhouette}
        className="standee-portrait"
        facing={side === "enemies" ? "left" : "right"}
      />
      {targetable && canTarget && <span className="standee-target-ring" aria-hidden="true" />}
      {isActing && actingIntentLabel !== undefined && (
        <div className="standee-action-callout" role="status">{actingIntentLabel}</div>
      )}
      {isActive && side === "heroes" && resources !== undefined && (
        <div className="standee-ap-badge" aria-label={`${resources.ap} action points`}>
          <span>AP</span><strong>{resources.ap}</strong>
        </div>
      )}
    </Tag>

    <div
      id={panelId}
      className={`standee-panel${highlighted ? " is-highlighted" : ""}${isLinked ? " is-linked" : ""}`}
    >
      <div className="standee-panel-head">
        <small>{classLabel}</small>
        <strong>{combatant.name}</strong>
        {queueLabel !== undefined && <span className="standee-queue-label">{queueLabel}</span>}
      </div>
      <div className="standee-meters">
        <CompactMeter label="HP" value={combatant.hp} max={combatant.maxHp} tone="blood" />
        {side === "heroes" && resources !== undefined && <>
          <CompactMeter label="MP" value={resources.mana} max={maxMana ?? resources.mana} tone="aether" />
          <CompactMeter label="ST" value={resources.stamina} max={maxStamina ?? resources.stamina} tone="iron" />
        </>}
        {block > 0 && <p className="standee-chip standee-chip-block">Block {block}</p>}
      </div>
      {(conditions.length > 0 || burnStacks > 0 || (injuries?.length ?? 0) > 0 || (guardLabels?.length ?? 0) > 0 || carrierNote !== undefined) && (
        <p className="standee-status">
          {conditions.map((entry) => <span key={entry.id} title={conditionTooltip(entry.id)}>{titleCase(entry.id)}</span>)}
          {burnStacks > 0 && <span className="standee-chip standee-chip-burn" title="Burn deals damage at the start of this combatant's turn.">Burn {burnStacks}</span>}
          {guardLabels?.map((label) => <span key={label} className="standee-chip standee-chip-guard">{label}</span>)}
          {injuries?.map((injury) => <span key={injury} className="warning">{titleCase(injury)}</span>)}
          {carrierNote !== undefined && <span className="standee-chip standee-chip-carrier">{carrierNote}</span>}
        </p>
      )}
    </div>
  </div>;
}

export type { EnemyIntentSnapshot };
