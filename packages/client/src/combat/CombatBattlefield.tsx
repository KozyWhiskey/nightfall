import { useMemo } from "react";
import type { CombatSnapshot, EnemyIntentSnapshot, HeroSnapshot, ItemInstance } from "@nightfall/contracts";
import { titleCase } from "../decisionUi.js";
import { initiativeQueueLabels, intentSummary, queueOrdinal, rotatedInitiativeOrder } from "./combatUi.js";
import { CombatStandee } from "./CombatStandee.js";

export function CombatBattlefield({
  combat,
  heroes,
  holdings,
  playbackActingId,
  playbackIntent,
  targetMode,
  linkedCombatantId,
  onLinkCombatant,
  onCombatantActivate
}: {
  combat: CombatSnapshot;
  heroes: readonly HeroSnapshot[];
  holdings: readonly ItemInstance[];
  playbackActingId: string | null;
  playbackIntent: EnemyIntentSnapshot | undefined;
  targetMode: "enemy" | "ally" | null;
  linkedCombatantId: string | null;
  onLinkCombatant: (combatantId: string | null) => void;
  onCombatantActivate: (combatantId: string, side: "heroes" | "enemies", targetable: boolean) => void;
}) {
  const activeId = playbackActingId ?? combat.activeCombatantId;
  const heroCombatants = combat.combatants.filter((entry) => entry.side === "heroes");
  const enemies = combat.combatants.filter((entry) => entry.side === "enemies" && !entry.destroyed);
  const queueLabels = useMemo(() => initiativeQueueLabels(combat), [combat]);
  const queueOrdinals = useMemo(() => {
    const order = rotatedInitiativeOrder(combat);
    return new Map(order.map((id, index) => [id, `${queueOrdinal(index)} in queue`]));
  }, [combat]);
  return <section
    className={`combat-battlefield${targetMode !== null ? ` is-targeting-${targetMode}` : ""}${playbackActingId !== null ? " is-playback" : ""}`}
    aria-label="Battlefield"
  >
    <div className="battlefield-floor" aria-hidden="true">
      <div className="battlefield-center-line" />
    </div>

    <div className="battlefield-side battlefield-heroes" aria-label="Expedition party">
      <header className="battlefield-side-label">Party</header>
      <div className="battlefield-formation hero-formation">
        {heroCombatants.map((combatant) => {
          const hero = heroes.find((entry) => entry.id === combatant.id);
          const resources = combat.heroResources.find((entry) => entry.heroId === combatant.id);
          const block = combatant.blockLayers.reduce((sum, layer) => sum + layer.amount, 0);
          const canTarget = targetMode === "ally" && !combatant.downed;
          return <CombatStandee
            key={combatant.id}
            combatant={combatant}
            side="heroes"
            classLabel={hero !== undefined ? titleCase(hero.classId) : "Hero"}
            isActive={combatant.id === activeId}
            isActing={combatant.id === playbackActingId}
            canTarget={canTarget}
            targetable={!combatant.downed}
            block={block}
            conditions={combatant.conditions}
            injuries={hero?.injuries}
            resources={resources}
            maxMana={hero?.maxMana}
            maxStamina={hero?.maxStamina}
            isLinked={combatant.id === linkedCombatantId}
            onLink={onLinkCombatant}
            onActivate={() => onCombatantActivate(combatant.id, "heroes", true)}
          />;
        })}
      </div>
    </div>

    <div className="battlefield-side battlefield-enemies" aria-label="Hostiles">
      <header className="battlefield-side-label">Hostiles</header>
      <div className="battlefield-formation enemy-formation">
        {enemies.map((enemy) => {
          const intent = combat.intents.find((entry) => entry.enemyId === enemy.id);
          const block = enemy.blockLayers.reduce((sum, layer) => sum + layer.amount, 0);
          const canTarget = targetMode === "enemy" && enemy.targetable;
          const carrier = enemy.carriedItemId === undefined
            ? undefined
            : holdings.find((item) => item.instanceId === enemy.carriedItemId);
          const acting = enemy.id === playbackActingId;
          const actingLabel = acting && playbackIntent !== undefined ? intentSummary(playbackIntent) : undefined;
          return <CombatStandee
            key={enemy.id}
            combatant={enemy}
            side="enemies"
            classLabel={enemy.kind === "entity" ? "Urgent target" : carrier !== undefined ? "Marked carrier" : "Hostile"}
            isActive={enemy.id === activeId}
            isActing={acting}
            actingIntentLabel={actingLabel}
            canTarget={canTarget}
            targetable={enemy.targetable}
            block={block}
            conditions={enemy.conditions}
            carrierNote={carrier !== undefined ? `Wielding ${titleCase(carrier.rarityId)}` : undefined}
            queueLabel={linkedCombatantId === enemy.id ? queueOrdinals.get(enemy.id) : queueLabels.get(enemy.id)}
            isLinked={enemy.id === linkedCombatantId}
            onLink={onLinkCombatant}
            onActivate={() => onCombatantActivate(enemy.id, "enemies", enemy.targetable)}
          />;
        })}
      </div>
    </div>
  </section>;
}
