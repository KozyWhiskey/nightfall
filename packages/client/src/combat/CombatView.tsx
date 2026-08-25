import { useEffect, useRef, useState } from "react";
import type { CardInstanceSnapshot, CommandType, GameSnapshot } from "@nightfall/contracts";
import {
  basicAffordability,
  cardAffordability,
  titleCase
} from "../decisionUi.js";
import { CombatBattlefield } from "./CombatBattlefield.js";
import { InitiativeTracker } from "./InitiativeTracker.js";
import { markedCarrierFieldStatus } from "./carrierChaseUi.js";
import { useTurnPlayback } from "./useTurnPlayback.js";
import { presentLootFact } from "../lootFactUi.js";

type ViewProps = { snapshot: GameSnapshot; send: (type: CommandType, payload: Record<string, unknown>, actorId?: string) => Promise<void> };

type PendingCombatAction =
  | { kind: "card"; cardInstanceId: string; targetSpec: "enemy" | "ally"; name: string }
  | { kind: "basicAttack"; name: string }
  | { kind: "supply"; itemId: string; name: string };

export function CombatView({ snapshot, send }: ViewProps) {
  const run = snapshot.activeRun!;
  const combat = run.combat!;
  const active = combat.combatants.find((entry) => entry.id === combat.activeCombatantId)!;
  const activeResources = combat.heroResources.find((entry) => entry.heroId === active.id);
  const hand = combat.cards.filter((card) => card.ownerId === active.id && card.zone === "hand");
  const enemies = combat.combatants.filter((entry) => entry.side === "enemies" && !entry.destroyed);
  const heroCombatants = combat.combatants.filter((entry) => entry.side === "heroes");
  const basics = combat.basicActions.find((entry) => entry.heroId === active.id);
  const encounterLabel = run.nodes.find((node) => node.id === run.currentNodeId)?.label ?? titleCase(combat.encounterId);
  const supplies = run.holdings.filter((item) => item.itemKind === "supply" && item.location.kind === "held_by_expedition");
  const livingHeroes = heroCombatants.filter((entry) => !entry.downed);
  const [supplyId, setSupplyId] = useState("");
  const [pending, setPending] = useState<PendingCombatAction | null>(null);
  const [linkedCombatantId, setLinkedCombatantId] = useState<string | null>(null);
  const [combatLogOpen, setCombatLogOpen] = useState(true);
  const linkClearTimerRef = useRef<number | null>(null);

  const handleLinkCombatant = (combatantId: string | null) => {
    if (linkClearTimerRef.current !== null) {
      globalThis.clearTimeout(linkClearTimerRef.current);
      linkClearTimerRef.current = null;
    }
    if (combatantId !== null) {
      setLinkedCombatantId(combatantId);
      return;
    }
    linkClearTimerRef.current = globalThis.setTimeout(() => setLinkedCombatantId(null), 60);
  };

  useEffect(() => () => {
    if (linkClearTimerRef.current !== null) globalThis.clearTimeout(linkClearTimerRef.current);
  }, []);
  const selectedSupplyId = supplies.some((item) => item.instanceId === supplyId) ? supplyId : (supplies[0]?.instanceId ?? "");
  const zoneCount = (zone: "draw" | "discard" | "exhaust") => combat.cards.filter((card) => card.ownerId === active.id && card.zone === zone).length;
  const heroTurn = active.side === "heroes";
  const awaitingEngage = combat.awaitingEngage === true;
  const playback = useTurnPlayback(combat, snapshot.revision);
  const interactionLocked = playback.busy || awaitingEngage;

  useEffect(() => { setPending(null); setLinkedCombatantId(null); }, [snapshot.revision, combat.activeCombatantId]);
  useEffect(() => {
    if (pending === null) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") setPending(null); };
    globalThis.addEventListener("keydown", onKey);
    return () => globalThis.removeEventListener("keydown", onKey);
  }, [pending]);

  const targetMode: "enemy" | "ally" | null =
    pending === null || interactionLocked ? null
      : pending.kind === "basicAttack" || (pending.kind === "card" && pending.targetSpec === "enemy") ? "enemy"
        : pending.kind === "supply" || (pending.kind === "card" && pending.targetSpec === "ally") ? "ally"
          : null;

  const pendingResourceSpend = (() => {
    if (pending?.kind !== "card" || interactionLocked) return undefined;
    const card = hand.find((entry) => entry.cardInstanceId === pending.cardInstanceId);
    if (card === undefined) return undefined;
    const mana = card.presentation.manaCost;
    const stamina = card.presentation.staminaCost;
    if (mana <= 0 && stamina <= 0) return undefined;
    return { heroId: active.id, mana, stamina };
  })();

  const playCardAt = (cardInstanceId: string, targetId?: string) => {
    void send("playCard", { cardInstanceId, ...(targetId === undefined ? {} : { targetId }) }, active.id);
    setPending(null);
  };

  const onCardActivate = (card: CardInstanceSnapshot) => {
    if (!heroTurn || active.id !== card.ownerId || interactionLocked || !cardAffordability(activeResources, card).ok) return;
    const spec = card.presentation.targetSpec;
    if (spec === "enemy" || spec === "ally") {
      setPending({ kind: "card", cardInstanceId: card.cardInstanceId, targetSpec: spec, name: card.presentation.name });
      return;
    }
    playCardAt(card.cardInstanceId);
  };

  const onCombatantActivate = (combatantId: string, side: "heroes" | "enemies", targetable: boolean) => {
    if (pending === null || !heroTurn || interactionLocked) return;
    if (pending.kind === "basicAttack") {
      if (side !== "enemies" || !targetable) return;
      void send("useBasicAttack", { targetId: combatantId }, active.id);
      setPending(null);
      return;
    }
    if (pending.kind === "card") {
      if (pending.targetSpec === "enemy" && (side !== "enemies" || !targetable)) return;
      if (pending.targetSpec === "ally" && side !== "heroes") return;
      playCardAt(pending.cardInstanceId, combatantId);
      return;
    }
    if (pending.kind === "supply") {
      if (side !== "heroes") return;
      void send("useSupply", { itemId: pending.itemId, targetId: combatantId }, active.id);
      setPending(null);
    }
  };

  const beginSupply = () => {
    if (combat.supplyUsed || selectedSupplyId === "" || livingHeroes.length === 0 || interactionLocked) return;
    const item = supplies.find((entry) => entry.instanceId === selectedSupplyId);
    if (item === undefined) return;
    // Inline dismissible warning via targeting banner (Cancel · Esc) — not window.confirm.
    setPending({ kind: "supply", itemId: selectedSupplyId, name: item.displaySnapshot.name });
  };

  const confirmSoloSupply = () => {
    if (pending?.kind !== "supply" || livingHeroes.length !== 1) return;
    void send("useSupply", { itemId: pending.itemId, targetId: livingHeroes[0]!.id }, active.id);
    setPending(null);
  };

  const prompt = pending === null
    ? null
    : pending.kind === "basicAttack" ? `Choose a target for ${pending.name}`
      : pending.kind === "supply"
        ? livingHeroes.length === 1
          ? `One supply per combat · item consumed. Confirm use of ${pending.name} on ${livingHeroes[0]!.name}?`
          : `One supply per combat · item consumed. Choose who receives ${pending.name}`
        : `Choose a target for ${pending.name}`;

  const actingCombatant = playback.actingCombatantId !== null
    ? combat.combatants.find((entry) => entry.id === playback.actingCombatantId)
    : undefined;

  const turnStatusLabel = awaitingEngage
    ? "Opening"
    : playback.busy
      ? "Enemy turn"
      : heroTurn
        ? "Your turn"
        : "Resolving";

  const recentCombatFacts = snapshot.latestFacts.slice(-8).reverse();
  const carrierStatus = markedCarrierFieldStatus(combat);

  return <main className={`combat-stage${targetMode !== null ? ` is-targeting-${targetMode}` : ""}${playback.busy ? " is-playback" : ""}${awaitingEngage ? " is-awaiting-engage" : ""}`} aria-label={`Combat: ${encounterLabel}`}>
    <header className="combat-chrome">
      <div><span>Combat · round {combat.round}</span><h1>{encounterLabel}</h1></div>
      <div className="combat-chrome-stats" aria-label="Turn status">
        <div><span>Run Gloom</span><strong>{run.runGloom}</strong></div>
        <div><span>{turnStatusLabel}</span><strong>{awaitingEngage ? "Read the field" : `${actingCombatant?.name ?? active.name}${heroTurn && activeResources !== undefined && !playback.busy ? ` · ${activeResources.ap} AP` : ""}`}</strong></div>
      </div>
      {carrierStatus !== undefined && (
        <p className="combat-carrier-status" role="status">{carrierStatus}</p>
      )}
    </header>

    <div className="combat-field">
      <CombatBattlefield
        combat={combat}
        heroes={run.heroes}
        holdings={run.holdings}
        playbackActingId={playback.actingCombatantId}
        playbackIntent={playback.actingIntent}
        targetMode={targetMode}
        linkedCombatantId={linkedCombatantId}
        pendingResourceSpend={pendingResourceSpend}
        onLinkCombatant={handleLinkCombatant}
        onCombatantActivate={onCombatantActivate}
      />
    </div>

    <aside className={`combat-side-column${combatLogOpen ? "" : " is-log-collapsed"}`} aria-label="Turn order and combat log">
      <InitiativeTracker
        combat={combat}
        playbackFocusId={playback.trackerFocusId}
        linkedCombatantId={linkedCombatantId}
        onLinkCombatant={handleLinkCombatant}
      />
      <section className={`combat-fact-log${combatLogOpen ? "" : " is-collapsed"}`} aria-live="polite" aria-label="Combat log">
        <button
          type="button"
          className="combat-fact-log-toggle"
          aria-expanded={combatLogOpen}
          aria-controls="combat-fact-log-body"
          onClick={() => setCombatLogOpen((open) => !open)}
        >
          <h2>Combat Log</h2>
          <span className="combat-fact-log-chevron" aria-hidden="true">{combatLogOpen ? "▾" : "▸"}</span>
        </button>
        <div id="combat-fact-log-body" className="combat-fact-log-body" hidden={!combatLogOpen}>
          {recentCombatFacts.length === 0
            ? <p className="combat-fact-log-empty">No actions yet this fight.</p>
            : <ol className="combat-fact-log-list">
              {recentCombatFacts.map((fact) => {
                const presented = presentLootFact(snapshot, fact);
                return <li key={fact.id} className={presented.className}>
                  {presented.glyph !== undefined && presented.rarityLabel !== undefined && (
                    <span className="fact-log-rarity" aria-hidden="true">{presented.glyph} {presented.rarityLabel}</span>
                  )}
                  <span className="fact-log-message">{presented.message}</span>
                </li>;
              })}
            </ol>}
        </div>
      </section>
    </aside>

    <footer className={`combat-dock${awaitingEngage || !heroTurn || playback.busy ? " is-waiting" : ""}${prompt !== null ? " is-prompting" : ""}${awaitingEngage ? " is-engage" : ""}`}>
      <div className="combat-dock-main">
      {awaitingEngage ? <>
        <div className="dock-prompt is-active engage-prompt" role="status" aria-live="polite">
          <span>Turn order and enemy intents are set. Engage when ready — hostiles who won initiative will act first.</span>
        </div>
        <div className="engage-row">
          <button type="button" className="primary engage-button" onClick={() => void send("engageCombat", {})}>Engage</button>
        </div>
      </> : <>
      <div className={`dock-prompt${prompt !== null ? " is-active" : ""}`} role="status" aria-live="polite">
        {prompt !== null ? <>
          <span>{prompt}</span>
          <div className="dock-prompt-actions">
            {pending?.kind === "supply" && livingHeroes.length === 1 && (
              <button type="button" className="primary" onClick={confirmSoloSupply}>Use supply</button>
            )}
            <button type="button" className="quiet" onClick={() => setPending(null)}>Cancel · Esc</button>
          </div>
        </> : <span className="dock-prompt-idle">Play a card or Basic · click a standee when a target is needed</span>}
      </div>

      {playback.busy && actingCombatant !== undefined ? <p className="waiting-line playback-line">
        <span className="playback-pulse" aria-hidden="true" />
        {actingCombatant.name} — {playback.actingIntent?.label ?? "acting…"}
      </p> : !heroTurn ? <p className="waiting-line">{active.name} is resolving…</p> : <>
        <div className="dock-controls">
          <div className="basic-row" aria-label="Basics and end turn">
            {basics !== undefined && <>
              <button
                className={pending?.kind === "basicAttack" ? "is-armed" : "quiet"}
                onClick={() => setPending({ kind: "basicAttack", name: basics.attack.name })}
                disabled={enemies.length === 0 || !basicAffordability(activeResources, basics.attack.apCost).ok}
                title={basicAffordability(activeResources, basics.attack.apCost).reason}
              >{basics.attack.name} · {basics.attack.apCost} AP</button>
              <button
                className="quiet"
                onClick={() => { setPending(null); void send("useBasicBlock", {}, active.id); }}
                disabled={!basicAffordability(activeResources, basics.block.apCost).ok}
                title={basicAffordability(activeResources, basics.block.apCost).reason}
              >{basics.block.name} · {basics.block.apCost} AP</button>
            </>}
            <button
              className={heroTurn && (activeResources?.ap ?? 0) === 0 ? "end-turn is-urgent" : "quiet"}
              onClick={() => { setPending(null); void send("endTurn", {}, active.id); }}
            >End turn</button>
          </div>
          <div className="supply-row">
            <label>Supply
              <select value={selectedSupplyId} onChange={(event) => setSupplyId(event.target.value)} disabled={combat.supplyUsed || supplies.length === 0}>
                {supplies.length === 0 ? <option value="">None carried</option> : supplies.map((item) => <option key={item.instanceId} value={item.instanceId}>{item.displaySnapshot.name}</option>)}
              </select>
            </label>
            <button
              className={pending?.kind === "supply" ? "is-armed" : "quiet"}
              disabled={combat.supplyUsed || selectedSupplyId === ""}
              onClick={beginSupply}
            >{combat.supplyUsed ? "Supply spent" : "Use · 1 AP"}</button>
          </div>
          <p className="zone-counts" aria-label="Deck zones">Draw {zoneCount("draw")} · Discard {zoneCount("discard")} · Exhaust {zoneCount("exhaust")}</p>
        </div>
        <div className="hand-rail" aria-label={`${active.name}'s hand`}>
          {hand.length === 0 ? <p className="empty">No cards in hand.</p> : hand.map((card) => {
            const afford = cardAffordability(activeResources, card);
            const playable = active.id === card.ownerId && afford.ok;
            const needsTarget = card.presentation.targetSpec === "ally" || card.presentation.targetSpec === "enemy";
            const selected = pending?.kind === "card" && pending.cardInstanceId === card.cardInstanceId;
            const tags = [
              card.exhaust ? "Exhaust" : undefined,
              card.selfDamage > 0 ? `Self ${card.selfDamage}` : undefined,
              card.retain ? "Retain" : undefined
            ].filter(Boolean) as string[];
            const targetWord = card.presentation.targetSpec === "ally" ? "Ally" : "Enemy";
            const actionHint = selected ? "Click a target"
              : needsTarget ? `${targetWord} · then target`
                : "Play";
            return <button
              type="button"
              key={card.cardInstanceId}
              className={`hand-card${selected ? " is-selected" : ""}${!playable ? " is-disabled" : ""}`}
              disabled={!playable}
              title={afford.reason}
              onClick={() => onCardActivate(card)}
              aria-pressed={selected}
              aria-label={`${card.presentation.name}, ${card.presentation.apCost} AP${needsTarget ? `, needs ${card.presentation.targetSpec} target` : ""}${afford.reason !== undefined ? `, ${afford.reason}` : ""}`}
            >
              <header>
                <small>{card.presentation.apCost} AP{card.presentation.manaCost > 0 ? ` · ${card.presentation.manaCost} Mana` : ""}{card.presentation.staminaCost > 0 ? ` · ${card.presentation.staminaCost} Stam` : ""}</small>
                <h3>{card.presentation.name}</h3>
              </header>
              <p>{card.presentation.summary}</p>
              {tags.length > 0 && <ul className="card-tags">{tags.map((tag) => <li key={tag}>{tag}</li>)}</ul>}
              <span className="card-action-hint">{actionHint}</span>
            </button>;
          })}
        </div>
      </>}
      </>}
      </div>
    </footer>
  </main>;
}
