import { useEffect, useMemo, useState, type ReactNode } from "react";
import type { CardInstanceSnapshot, CommandType, DecisionChoiceSnapshot, EquipmentSlot, GameSnapshot, HeroSnapshot, ItemInstance } from "@nightfall/contracts";
import { CombatPortrait, IntentGlyph } from "./art/ArtImage.js";
import { combatantArtSrc, intentArtSrc, silhouetteForCombatant, silhouetteForHero, type IntentArtKind } from "./art/artMap.js";
import { useNightfall } from "./store.js";

const titleCase = (value: string) => value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

const EQUIP_SLOTS: readonly EquipmentSlot[] = ["mainHand", "offHand", "head", "body", "gloves", "legs", "feet", "relic1", "relic2"];

function itemById(holdings: readonly ItemInstance[], instanceId: string | null): ItemInstance | undefined {
  if (instanceId === null) return undefined;
  return holdings.find((item) => item.instanceId === instanceId);
}

function PillarRail({ lit }: { lit: number }) {
  return <div className="pillar-rail" aria-label={`${lit} of 10 Haven pillars lit`}>
    {Array.from({ length: 10 }, (_, index) => <span key={index} className={index < lit ? "pillar is-lit" : "pillar is-dark"}><i /></span>)}
  </div>;
}

function Meter({ label, value, max, tone = "ember" }: { label: string; value: number; max: number; tone?: string }) {
  return <div className="meter"><span>{label}</span><strong>{value}/{max}</strong><div className="meter-track"><i className={tone} style={{ width: `${Math.max(0, Math.min(100, value / max * 100))}%` }} /></div></div>;
}

function HeroLedger({ hero }: { hero: HeroSnapshot }) {
  return <article className="hero-ledger">
    <div><small>{titleCase(hero.classId)}</small><h3>{hero.name}</h3></div>
    <div className="hero-meters"><Meter label="HP" value={hero.hp} max={hero.maxHp} tone="blood" /><Meter label="Mana" value={hero.mana} max={hero.maxMana} tone="aether" /><Meter label="Stamina" value={hero.stamina} max={hero.maxStamina} tone="iron" /></div>
    <p className="stat-line">VIT {hero.attributes.vit} · DEX {hero.attributes.dex} · STR {hero.attributes.str} · INT {hero.attributes.int}</p>
    {hero.injuries.length > 0 && <p className="warning">Injuries: {hero.injuries.map(titleCase).join(", ")}</p>}
  </article>;
}

function PartyHeroCard({ hero, holdings }: { hero: HeroSnapshot; holdings: readonly ItemInstance[] }) {
  const equipped = EQUIP_SLOTS
    .map((slot) => ({ slot, item: itemById(holdings, hero.equipment[slot]) }))
    .filter((entry) => entry.item !== undefined) as { slot: EquipmentSlot; item: ItemInstance }[];
  const learned = [...hero.learnedCardIds, ...hero.runLearnedCardIds];
  return <article className="party-hero">
    <header>
      <div>
        <small>{titleCase(hero.classId)}{hero.downed ? " · Downed" : ""}</small>
        <h3>{hero.name}</h3>
      </div>
      {hero.temporaryAttribute !== undefined && <span className="party-chip">Temp +1 {hero.temporaryAttribute.toUpperCase()}</span>}
    </header>
    <div className="hero-meters">
      <Meter label="HP" value={hero.hp} max={hero.maxHp} tone="blood" />
      <Meter label="Mana" value={hero.mana} max={hero.maxMana} tone="aether" />
      <Meter label="Stamina" value={hero.stamina} max={hero.maxStamina} tone="iron" />
    </div>
    <p className="stat-line">VIT {hero.attributes.vit} · DEX {hero.attributes.dex} · STR {hero.attributes.str} · INT {hero.attributes.int}</p>
    {hero.injuries.length > 0 && <p className="warning">Injuries: {hero.injuries.map(titleCase).join(", ")}</p>}
    <h4>Equipped</h4>
    {equipped.length === 0 ? <p className="empty">No gear equipped.</p> : <ul className="party-gear">
      {equipped.map(({ slot, item }) => <li key={item.instanceId}>
        <div>
          <small>{titleCase(slot)} · {titleCase(item.rarityId)}</small>
          <strong>{item.displaySnapshot.name}</strong>
          <ItemEffects description={item.displaySnapshot.description} />
        </div>
        {item.curseId !== undefined && <span className="warning">{titleCase(item.curseId)}</span>}
      </li>)}
    </ul>}
    {learned.length > 0 && <>
      <h4>Learned patterns</h4>
      <p className="party-learned">{learned.map(titleCase).join(" · ")}</p>
    </>}
  </article>;
}

function PartyPanel({ snapshot, open, onClose }: { snapshot: GameSnapshot; open: boolean; onClose: () => void }) {
  const run = snapshot.activeRun;
  const heroes = run?.heroes ?? snapshot.haven.heroes;
  const holdings = run?.holdings ?? snapshot.haven.holdings;
  const packItems = run === undefined
    ? holdings.filter((item) => item.location.kind === "haven")
    : holdings.filter((item) => item.location.kind === "held_by_expedition");
  const sealed = run?.waypointChest ?? [];

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    globalThis.addEventListener("keydown", onKey);
    return () => globalThis.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return <>
    <button type="button" className="party-backdrop" aria-label="Close party panel" onClick={onClose} />
    <aside className="party-drawer" role="dialog" aria-modal="true" aria-label="Party and packs">
      <header className="party-drawer-head">
        <div>
          <span>{run === undefined ? "Haven roster" : "Expedition roster"}</span>
          <h2>Party & packs</h2>
        </div>
        <button type="button" className="quiet" onClick={onClose}>Close · Esc</button>
      </header>
      <div className="party-drawer-body">
        <section className="party-section">
          <h3>Survivors</h3>
          <div className="party-hero-stack">{heroes.map((hero) => <PartyHeroCard key={hero.id} hero={hero} holdings={holdings} />)}</div>
        </section>
        <section className="party-section">
          <h3>{run === undefined ? "Haven-held" : "Carried — at risk"}</h3>
          <ItemList
            items={packItems}
            empty={run === undefined ? "No spare Haven holdings." : "No unsealed expedition holdings."}
          />
        </section>
        {run !== undefined && <>
          <section className="party-section">
            <h3>Materials</h3>
            <div className="party-materials">{Object.entries(run.materials).map(([id, amount]) => <div key={id}><span>{titleCase(id)}</span><strong>{amount}</strong></div>)}</div>
          </section>
          {sealed.length > 0 && <section className="party-section">
            <h3>Sealed at waypoint</h3>
            <ItemList items={sealed} empty="No sealed items." />
          </section>}
        </>}
      </div>
    </aside>
  </>;
}

function Page({ eyebrow, title, intro, children, aside }: { eyebrow: string; title: string; intro?: string; children: ReactNode; aside?: ReactNode }) {
  return <main className="stage">
    <header className="stage-chrome">
      <div>
        <span>{eyebrow}</span>
        <h1>{title}</h1>
        {intro !== undefined && <p className="stage-intro">{intro}</p>}
      </div>
      {aside}
    </header>
    <div className="stage-body">{children}</div>
  </main>;
}

function HavenView({ snapshot, send }: ViewProps) {
  const [name, setName] = useState(snapshot.haven.name);
  const pendingLeadership = snapshot.haven.heroes.filter((hero) => hero.pendingLeadership > 0);
  return <Page
    eyebrow="Pillarhouse record"
    title={snapshot.haven.name}
    intro="Everything committed to an expedition can be lost until sealed or brought home."
    aside={<button className="primary" onClick={() => { if (globalThis.confirm("Commit both heroes and all equipped Haven gear to wipe risk?")) void send("commitEmbark"); }}>Embark</button>}
  >
    {snapshot.view === "postReturn" && <section className="homecoming-callout"><div><span>Homecoming ledger</span><strong>Returned holdings are banked. Review the Haven, then close this expedition.</strong></div><button className="primary" onClick={() => void send("continueToHaven")}>Finish homecoming</button></section>}
    <section className="haven-status">
      <div><PillarRail lit={snapshot.haven.litPillars} /><p><strong>{snapshot.haven.litPillars}/10 pillars</strong> · Haven Gloom {snapshot.haven.gloom} · Next embark {snapshot.haven.gloom * 4} Run Gloom</p></div>
      <section className="rename-line"><label>Haven name<input value={name} maxLength={40} onChange={(event) => setName(event.target.value)} /></label><button onClick={() => void send("nameHaven", { name })}>Record name</button></section>
    </section>
    <div className="two-column">
      <section className="stage-panel"><h2>Expedition pair</h2><div className="hero-grid">{snapshot.haven.heroes.map((hero) => <HeroLedger hero={hero} key={hero.id} />)}</div></section>
      <section className="stage-panel">
        <h2>Stores</h2>
        <div className="resource-grid">{Object.entries(snapshot.haven.resources).map(([id, amount]) => <div key={id}><span>{titleCase(id)}</span><strong>{amount}</strong></div>)}</div>
        <h2>Haven works</h2>
        <div className="building-list">{snapshot.haven.buildings.map((building) => <article key={building.id}><div><strong>{titleCase(building.id)}</strong><span>{titleCase(building.state)}</span></div>{building.state === "available" && ["cinder_forge", "quiet_house", "wardyard"].includes(building.id) && <button onClick={() => { if (globalThis.confirm(`Construct ${titleCase(building.id)} with returned materials?`)) void send("buildBuilding", { buildingId: building.id }); }}>Construct</button>}</article>)}</div>
      </section>
    </div>
    {snapshot.haven.litPillars < 10 && snapshot.haven.resources.ember_shard > 0 && <button onClick={() => { if (globalThis.confirm("Spend one Ember Shard to relight a pillar permanently?")) void send("repairPillar"); }}>Relight one pillar</button>}
    {pendingLeadership.length > 0 && snapshot.haven.buildings.some((building) => building.id === "wardyard" && building.state === "built") && <section className="stage-panel"><h2>Wardyard Leadership</h2>{pendingLeadership.map((hero) => <div className="choice-row" key={hero.id}><strong>{hero.name}</strong>{(["vit", "dex", "str", "int"] as const).map((stat) => <button key={stat} onClick={() => { if (globalThis.confirm(`Permanently assign ${hero.name}'s Leadership Point to ${stat.toUpperCase()}?`)) void send("assignLeadership", { heroId: hero.id, stat }); }}>{stat.toUpperCase()}</button>)}</div>)}</section>}
    <section className="stage-panel"><h2>Haven-held gear and patterns</h2><ItemList items={snapshot.haven.holdings} empty="No spare holdings. Equipped starter gear is listed in each hero's sheet." /></section>
  </Page>;
}

function gloomBand(value: number) { return value < 40 ? "Held at Bay" : value < 70 ? "Encroaching" : value < 90 ? "Pressing" : "Overrun"; }

function MapView({ snapshot, send }: ViewProps) {
  const run = snapshot.activeRun!;
  const legal = run.edges.filter((edge) => edge.from === run.currentNodeId);
  const byId = new Map(run.nodes.map((node) => [node.id, node]));
  return <Page
    eyebrow="Expedition leg"
    title="The Unlit Road"
    intro="Event identity stays under fog until entered. Every edge adds exactly +5 Run Gloom."
    aside={<div className="stage-stat-row" aria-label="Run pressure">
      <div><span>Run Gloom</span><strong>{run.runGloom}</strong></div>
      <div><span>Pressure</span><strong>{gloomBand(run.runGloom)}</strong></div>
      <div><span>Next edge</span><strong>+5</strong></div>
    </div>}
  >
    <section className="route-strip" aria-label="Visited route">{run.visitedNodeIds.map((id, index) => <span key={`${id}-${index}`}>{byId.get(id)?.label ?? titleCase(id)}</span>)}</section>
    <div className="two-column map-layout">
      <section className="stage-panel">
        <h2>Choose the next road</h2>
        <div className="road-choices">{legal.map((edge) => {
          const node = byId.get(edge.to)!;
          return <button key={edge.id} onClick={() => void send("chooseMapEdge", { edgeId: edge.id })}>
            <span>{node.visibility === "hidden" ? "Unknown event" : titleCase(node.type)}</span>
            <strong>{node.label}</strong>
            <small>Travel · +5 Run Gloom</small>
          </button>;
        })}</div>
      </section>
      <section className="stage-panel">
        <h2>Party state</h2>
        <div className="hero-grid">{run.heroes.map((hero) => <HeroLedger hero={hero} key={hero.id} />)}</div>
      </section>
    </div>
  </Page>;
}

type PendingCombatAction =
  | { kind: "card"; cardInstanceId: string; targetSpec: "enemy" | "ally"; name: string }
  | { kind: "basicAttack"; name: string }
  | { kind: "supply"; itemId: string; name: string };

function intentKind(intent: { label: string; targetLabel: string; magnitude: number }): IntentArtKind {
  const label = intent.label.toLowerCase();
  if (intent.magnitude > 0) return "attack";
  if (/guard|block|circle|skitter|hollow|dirge|swell|mourning/.test(label)) return "defend";
  if (/fury|borrowed|buff|gather/.test(label) || /allies/i.test(intent.targetLabel)) return "buff";
  return "special";
}

function intentGlyphChar(kind: IntentArtKind): string {
  return kind === "attack" ? "▲" : kind === "defend" ? "◆" : kind === "buff" ? "✚" : "✦";
}

function IntentBadge({ intent }: { intent: { label: string; targetLabel: string; magnitude: number } }) {
  const kind = intentKind(intent);
  const kindLabel = kind === "attack" ? "Attack" : kind === "defend" ? "Defend" : kind === "buff" ? "Buff" : "Special";
  return <div className={`intent-badge intent-${kind}`} role="group" aria-label={`${kindLabel} intent: ${intent.label}, ${intent.targetLabel}${intent.magnitude > 0 ? `, magnitude ${intent.magnitude}` : ""}`}>
    <span className="intent-glyph" aria-hidden="true">
      <IntentGlyph src={intentArtSrc(kind)} textFallback={intentGlyphChar(kind)} />
    </span>
    <span className="intent-copy"><strong>{intent.label}</strong><small>{intent.targetLabel}{intent.magnitude > 0 ? ` · ${intent.magnitude}` : ""}</small></span>
  </div>;
}

function CompactMeter({ label, value, max, tone }: { label: string; value: number; max: number; tone: string }) {
  return <div className="compact-meter" title={`${label} ${value}/${max}`}><span>{label}</span><div className="compact-meter-track" aria-hidden="true"><i className={tone} style={{ width: `${Math.max(0, Math.min(100, max === 0 ? 0 : value / max * 100))}%` }} /></div><strong>{value}</strong></div>;
}

function CombatView({ snapshot, send }: ViewProps) {
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
  const selectedSupplyId = supplies.some((item) => item.instanceId === supplyId) ? supplyId : (supplies[0]?.instanceId ?? "");
  const zoneCount = (zone: "draw" | "discard" | "exhaust") => combat.cards.filter((card) => card.ownerId === active.id && card.zone === zone).length;
  const heroTurn = active.side === "heroes";

  useEffect(() => { setPending(null); }, [snapshot.revision, combat.activeCombatantId]);
  useEffect(() => {
    if (pending === null) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") setPending(null); };
    globalThis.addEventListener("keydown", onKey);
    return () => globalThis.removeEventListener("keydown", onKey);
  }, [pending]);

  const targetMode: "enemy" | "ally" | null =
    pending === null ? null
      : pending.kind === "basicAttack" || (pending.kind === "card" && pending.targetSpec === "enemy") ? "enemy"
        : pending.kind === "supply" || (pending.kind === "card" && pending.targetSpec === "ally") ? "ally"
          : null;

  const playCardAt = (cardInstanceId: string, targetId?: string) => {
    void send("playCard", { cardInstanceId, ...(targetId === undefined ? {} : { targetId }) }, active.id);
    setPending(null);
  };

  const onCardActivate = (card: CardInstanceSnapshot) => {
    if (!heroTurn || active.id !== card.ownerId) return;
    const spec = card.presentation.targetSpec;
    if (spec === "enemy" || spec === "ally") {
      setPending({ kind: "card", cardInstanceId: card.cardInstanceId, targetSpec: spec, name: card.presentation.name });
      return;
    }
    playCardAt(card.cardInstanceId);
  };

  const onCombatantActivate = (combatantId: string, side: "heroes" | "enemies", targetable: boolean) => {
    if (pending === null || !heroTurn) return;
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
    if (combat.supplyUsed || selectedSupplyId === "" || livingHeroes.length === 0) return;
    const item = supplies.find((entry) => entry.instanceId === selectedSupplyId);
    if (item === undefined) return;
    if (!globalThis.confirm("Use this supply? One supply action per combat, and the item is consumed.")) return;
    if (livingHeroes.length === 1) {
      void send("useSupply", { itemId: selectedSupplyId, targetId: livingHeroes[0]!.id }, active.id);
      return;
    }
    setPending({ kind: "supply", itemId: selectedSupplyId, name: item.displaySnapshot.name });
  };

  const prompt = pending === null
    ? null
    : pending.kind === "basicAttack" ? `Choose a target for ${pending.name}`
      : pending.kind === "supply" ? `Choose who receives ${pending.name}`
        : `Choose a target for ${pending.name}`;

  return <main className={`combat-stage${targetMode !== null ? ` is-targeting-${targetMode}` : ""}`} aria-label={`Combat: ${encounterLabel}`}>
    <header className="combat-chrome">
      <div><span>Combat · round {combat.round}</span><h1>{encounterLabel}</h1></div>
      <div className="combat-chrome-stats" aria-label="Turn status">
        <div><span>Actor</span><strong>{active.name}</strong></div>
        <div><span>AP</span><strong>{heroTurn ? activeResources?.ap ?? "—" : "—"}</strong></div>
        <div><span>Run Gloom</span><strong>{run.runGloom}</strong></div>
      </div>
    </header>

    {prompt !== null && <div className="targeting-banner" role="status">
      <span>{prompt}</span>
      <button type="button" className="quiet" onClick={() => setPending(null)}>Cancel · Esc</button>
    </div>}

    <section className="combat-hostiles" aria-label="Hostiles and intents">
      {enemies.map((enemy) => {
        const intent = combat.intents.find((entry) => entry.enemyId === enemy.id);
        const block = enemy.blockLayers.reduce((sum, layer) => sum + layer.amount, 0);
        const isActive = enemy.id === active.id;
        const canTarget = targetMode === "enemy" && enemy.targetable;
        const Tag = canTarget ? "button" : "article";
        return <Tag
          key={enemy.id}
          type={canTarget ? "button" : undefined}
          className={`hostile-card${isActive ? " is-active" : ""}${enemy.kind === "entity" ? " is-entity" : ""}${canTarget ? " is-targetable" : ""}`}
          onClick={canTarget ? () => onCombatantActivate(enemy.id, "enemies", enemy.targetable) : undefined}
          aria-label={canTarget ? `Target ${enemy.name}` : undefined}
        >
          <CombatPortrait
            src={combatantArtSrc(enemy.kind === "entity" ? "entity" : "enemy", enemy.definitionId)}
            variant={silhouetteForCombatant(enemy.kind === "entity" ? "entity" : "enemy")}
          />
          <div className="hostile-body">
            <div className="hostile-head">
              <small>{enemy.kind === "entity" ? "Urgent target" : "Hostile"}</small>
              <h2>{enemy.name}</h2>
            </div>
            <CompactMeter label="HP" value={enemy.hp} max={enemy.maxHp} tone="gloom" />
            {block > 0 && <p className="block-chip">Block {block}</p>}
            {enemy.conditions.length > 0 && <p className="condition-line">{enemy.conditions.map((entry) => titleCase(entry.id)).join(" · ")}</p>}
            {intent !== undefined ? <IntentBadge intent={intent} /> : <p className="intent-pending">Intent pending</p>}
          </div>
        </Tag>;
      })}
    </section>

    <section className="combat-party" aria-label="Expedition pair">
      {heroCombatants.map((combatant) => {
        const hero = run.heroes.find((entry) => entry.id === combatant.id);
        const resources = combat.heroResources.find((entry) => entry.heroId === combatant.id);
        const block = combatant.blockLayers.reduce((sum, layer) => sum + layer.amount, 0);
        const isActive = combatant.id === active.id;
        const canTarget = targetMode === "ally" && !combatant.downed;
        const classId = hero?.classId ?? combatant.definitionId;
        const Tag = canTarget ? "button" : "article";
        return <Tag
          key={combatant.id}
          type={canTarget ? "button" : undefined}
          className={`party-card${isActive ? " is-active" : ""}${combatant.downed ? " is-downed" : ""}${canTarget ? " is-targetable" : ""}`}
          onClick={canTarget ? () => onCombatantActivate(combatant.id, "heroes", true) : undefined}
          aria-label={canTarget ? `Target ${combatant.name}` : undefined}
        >
          <CombatPortrait src={combatantArtSrc("hero", classId)} variant={silhouetteForHero(classId)} />
          <div className="party-body">
            <div className="party-head">
              <div>
                <small>{hero !== undefined ? titleCase(hero.classId) : "Hero"}{isActive ? " · acting" : ""}</small>
                <h2>{combatant.name}</h2>
              </div>
              {isActive && resources !== undefined && <div className="ap-chip" aria-label={`${resources.ap} action points`}><span>AP</span><strong>{resources.ap}</strong></div>}
            </div>
            <div className="party-meters">
              <CompactMeter label="HP" value={combatant.hp} max={combatant.maxHp} tone="blood" />
              {resources !== undefined && <>
                <CompactMeter label="MP" value={resources.mana} max={hero?.maxMana ?? resources.mana} tone="aether" />
                <CompactMeter label="ST" value={resources.stamina} max={hero?.maxStamina ?? resources.stamina} tone="iron" />
              </>}
            </div>
            {(block > 0 || combatant.conditions.length > 0 || (hero?.injuries.length ?? 0) > 0) && <p className="party-status">
              {block > 0 && <span>Block {block}</span>}
              {combatant.conditions.map((entry) => <span key={entry.id}>{titleCase(entry.id)}</span>)}
              {hero?.injuries.map((injury) => <span key={injury} className="warning">{titleCase(injury)}</span>)}
            </p>}
          </div>
        </Tag>;
      })}
    </section>

    <ol className="combat-timeline" aria-label="Complete initiative timeline">
      {combat.timeline.map((id) => {
        const entry = combat.combatants.find((candidate) => candidate.id === id);
        if (entry === undefined || entry.destroyed) return null;
        const intent = combat.intents.find((candidate) => candidate.enemyId === id);
        const kind = intent !== undefined ? intentKind(intent) : undefined;
        return <li key={id} className={`${id === active.id ? "is-active" : ""} ${entry.side === "enemies" ? "is-enemy" : "is-hero"}`.trim()}>
          <b>{entry.initiative}</b>
          <span>{entry.name}</span>
          {intent !== undefined && kind !== undefined && <small>
            <span className="timeline-intent-glyph" aria-hidden="true">
              <IntentGlyph src={intentArtSrc(kind)} textFallback={intentGlyphChar(kind)} />
            </span>
            {intent.label}{intent.magnitude > 0 ? ` ${intent.magnitude}` : ""}
          </small>}
        </li>;
      })}
    </ol>

    <div className="combat-field" aria-hidden="true" />

    <footer className={`combat-dock${!heroTurn ? " is-waiting" : ""}`}>
      {!heroTurn ? <p className="waiting-line">{active.name} is resolving…</p> : <>
        <div className="dock-controls">
          <div className="basic-row">
            {basics !== undefined && <>
              <button
                className={pending?.kind === "basicAttack" ? "is-armed" : ""}
                onClick={() => setPending({ kind: "basicAttack", name: basics.attack.name })}
                disabled={enemies.length === 0}
              >{basics.attack.name} · {basics.attack.apCost} AP</button>
              <button onClick={() => { setPending(null); void send("useBasicBlock", {}, active.id); }}>{basics.block.name} · {basics.block.apCost} AP</button>
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
              className={pending?.kind === "supply" ? "is-armed" : ""}
              disabled={combat.supplyUsed || selectedSupplyId === ""}
              onClick={beginSupply}
            >{combat.supplyUsed ? "Supply spent" : "Use · 1 AP"}</button>
          </div>
          <p className="zone-counts" aria-label="Deck zones">Draw {zoneCount("draw")} · Discard {zoneCount("discard")} · Exhaust {zoneCount("exhaust")}</p>
        </div>
        <div className="hand-rail" aria-label={`${active.name}'s hand`}>
          {hand.length === 0 ? <p className="empty">No cards in hand.</p> : hand.map((card) => {
            const needsTarget = card.presentation.targetSpec === "ally" || card.presentation.targetSpec === "enemy";
            const selected = pending?.kind === "card" && pending.cardInstanceId === card.cardInstanceId;
            const tags = [
              card.exhaust ? "Exhaust" : undefined,
              card.selfDamage > 0 ? `Self ${card.selfDamage}` : undefined,
              card.retain ? "Retain" : undefined,
              needsTarget ? (card.presentation.targetSpec === "ally" ? "Ally" : "Enemy") : undefined
            ].filter(Boolean) as string[];
            return <button
              type="button"
              key={card.cardInstanceId}
              className={`hand-card${selected ? " is-selected" : ""}`}
              disabled={active.id !== card.ownerId}
              onClick={() => onCardActivate(card)}
              aria-pressed={selected}
              aria-label={`${card.presentation.name}, ${card.presentation.apCost} AP${needsTarget ? `, needs ${card.presentation.targetSpec} target` : ""}`}
            >
              <header>
                <small>{card.presentation.apCost} AP{card.presentation.manaCost > 0 ? ` · ${card.presentation.manaCost} Mana` : ""}{card.presentation.staminaCost > 0 ? ` · ${card.presentation.staminaCost} Stam` : ""}</small>
                <h3>{card.presentation.name}</h3>
              </header>
              <p>{card.presentation.summary}</p>
              {tags.length > 0 && <ul className="card-tags">{tags.map((tag) => <li key={tag}>{tag}</li>)}</ul>}
              <span className="card-action-hint">{selected ? "Click a target" : needsTarget ? "Select · then target" : "Play"}</span>
            </button>;
          })}
        </div>
      </>}
    </footer>
  </main>;
}

function effectLines(description: string): string[] {
  return description.split(/\n+/).map((line) => line.trim()).filter((line) => line.length > 0);
}

function ItemEffects({ description }: { description: string }) {
  const lines = effectLines(description);
  if (lines.length === 0) return null;
  if (lines.length === 1) return <p className="offer-effect-lead">{lines[0]}</p>;
  return <ul className="offer-effects" aria-label="Item effects">{lines.map((line) => <li key={line}>{line}</li>)}</ul>;
}

function ItemList({ items, empty }: { items: readonly ItemInstance[]; empty: string }) {
  if (items.length === 0) return <p className="empty">{empty}</p>;
  return <div className="item-list">{items.map((item) => <article key={item.instanceId}><div><small>{titleCase(item.rarityId)} · {titleCase(item.location.kind)}</small><strong>{item.displaySnapshot.name}</strong><ItemEffects description={item.displaySnapshot.description} /></div>{item.curseId !== undefined && <span className="warning">{titleCase(item.curseId)}</span>}</article>)}</div>;
}

function RewardView({ snapshot, send }: ViewProps) {
  const decision = snapshot.activeRun!.pendingDecision; if (decision?.kind !== "reward") return null;
  return <Page
    eyebrow="Recovered opportunity"
    title="Choose what the road gives back"
    intro="The automatic bundle is already secured—but still carried at risk. Choose one fully identified offer."
  >
    <section className="bundle"><strong>Automatic bundle</strong><span>{Object.entries(decision.automatic).map(([id, amount]) => `${amount} ${titleCase(id)}`).join(" · ")}</span></section>
    <div className="reward-grid">{decision.offers.map((offer) => <article key={offer.id} className="offer-card">
      <small>{titleCase(offer.item.rarityId)} · {titleCase(offer.kind)}</small>
      <h2>{offer.item.displaySnapshot.name}</h2>
      <ItemEffects description={offer.item.displaySnapshot.description} />
      <p className="ownership-tag">Carried — at risk until Return or chest sealing.</p>
      <button onClick={() => void send("chooseReward", { offerId: offer.id })}>Take {offer.item.displaySnapshot.name}</button>
    </article>)}</div>
    {decision.sourceId !== "lantern_smother" && <button className="quiet leave-action" onClick={() => void send("leaveReward")}>Leave both offers</button>}
  </Page>;
}

function ChoiceView({ snapshot, send, kind }: ViewProps & { kind: "event" | "rest" | "craft" }) {
  const decision = snapshot.activeRun!.pendingDecision; if (decision?.kind !== kind) return null;
  const heading = decision.kind === "event" ? titleCase(decision.eventId) : decision.kind === "rest" ? "Rest at the last light" : "Safe craft";
  const intro = decision.kind === "rest"
    ? `Base −12 Gloom · modifier ${decision.modifier >= 0 ? "+" : ""}${decision.modifier} · effective −${decision.baseGloomReduction - decision.modifier}`
    : "Every cost and probability below is resolved by the host's named stream.";
  const firstGear = snapshot.activeRun!.holdings.find((item) => item.itemKind === "equipment" && item.location.kind !== "lost" && item.location.kind !== "consumed");
  const heroId = snapshot.activeRun!.heroes[0]?.id;
  const choose = (choice: DecisionChoiceSnapshot) => {
    if (decision.kind === "event") void send("chooseEventOption", { optionId: choice.id, ...(firstGear === undefined ? {} : { targetItemId: firstGear.instanceId }) });
    else if (decision.kind === "rest") void send("chooseRestOption", { optionId: choice.id, heroId });
    else if (globalThis.confirm(`Consume the disclosed inputs for ${choice.label}?`)) void send("chooseCraftRecipe", { recipeId: choice.id, heroId, ...(firstGear === undefined ? {} : { targetItemId: firstGear.instanceId }) });
  };
  return <Page eyebrow={kind === "event" ? "Unresolved memory" : "Preparation moment"} title={heading} intro={intro}>
    <div className="choice-grid">{decision.choices.map((choice) => <article key={choice.id} className="offer-card">
      <h2>{choice.label}</h2>
      <p>{choice.detail}</p>
      <button onClick={() => choose(choice)}>Choose {choice.label}</button>
    </article>)}</div>
  </Page>;
}

function GrowthView({ snapshot, send }: ViewProps) {
  const decision = snapshot.activeRun!.pendingDecision; if (decision?.kind !== "temporary_growth") return null;
  return <Page eyebrow="Expedition growth" title="The road changes its survivors" intro="Each point lasts for this expedition only and fades on Return.">
    <div className="growth-board">{decision.heroIds.map((id) => {
      const hero = snapshot.activeRun!.heroes.find((entry) => entry.id === id)!;
      return <section className="growth-row" key={id}>
        <HeroLedger hero={hero} />
        <div className="growth-picks">{(["vit", "dex", "str", "int"] as const).map((stat) => <button key={stat} onClick={() => void send("assignTemporaryStat", { heroId: id, stat })}>+1 {stat.toUpperCase()}</button>)}</div>
      </section>;
    })}</div>
  </Page>;
}

function WaypointView({ snapshot, send }: ViewProps) {
  const run = snapshot.activeRun!;
  const held = run.holdings.filter((item) => ["equipment", "scroll", "ember_shard"].includes(item.itemKind) && item.location.kind === "held_by_expedition");
  const edges = run.edges.filter((edge) => edge.from === "waypoint");
  return <Page
    eyebrow="Permanent ground claimed"
    title="Whisperwood Waypoint"
    intro="Waypoint, settlement trace, and Ember Vault blueprint are permanent. Physical rewards still need protection or a successful Return."
    aside={<div className="stage-stat-row" aria-label="Waypoint status">
      <div><span>Chest</span><strong>{run.waypointChest.length}/3</strong></div>
      <div><span>Ember Shards</span><strong>{run.materials.ember_shard}</strong></div>
    </div>}
  >
    <div className="two-column">
      <section className="stage-panel">
        <h2>Seal carried value</h2>
        <ItemList items={run.waypointChest} empty="No item sealed yet." />
        <div className="seal-actions">{held.map((item) => <button key={item.instanceId} onClick={() => { if (globalThis.confirm(`Seal ${item.displaySnapshot.name}? It cannot be used on the Return leg.`)) void send("sealChestItem", { itemId: item.instanceId }); }}>Seal {item.displaySnapshot.name}</button>)}</div>
        {snapshot.haven.litPillars < 10 && run.materials.ember_shard > 0 && <button onClick={() => { if (globalThis.confirm("Spend one Ember Shard now? This repair remains even if the Return wipes.")) void send("spendEmberShardRite"); }}>Perform remote pillar rite</button>}
      </section>
      <section className="stage-panel">
        <h2>Choose the one Return leg</h2>
        <div className="road-choices">{edges.map((edge) => <button key={edge.id} onClick={() => void send("chooseReturnEdge", { edgeId: edge.id })}><strong>{titleCase(edge.to)}</strong><small>Travel · +5 Run Gloom</small></button>)}</div>
      </section>
    </div>
  </Page>;
}

function TerminalView({ snapshot, send }: ViewProps) {
  const run = snapshot.activeRun!;
  const result = run.terminalResult!;
  const title = result === "return" ? "They came home" : result === "succession" ? "A new light is named" : "The road kept their names";
  return <Page
    eyebrow={titleCase(result)}
    title={title}
    intro={result === "return" ? "Recovered holdings are banked once. Temporary growth faded; Leadership now waits at the Wardyard." : "Unsealed expedition holdings and the committed party are lost. Protected and permanent world facts remain."}
    aside={<button className="primary" onClick={() => void send("continueToHaven")}>{snapshot.view === "returnResults" ? "Review Haven" : "Continue to Haven"}</button>}
  >
    <section className="terminal-ledger stage-panel">
      <PillarRail lit={snapshot.haven.litPillars} />
      <h2>{snapshot.haven.name}</h2>
      <p>{snapshot.haven.litPillars}/10 pillars lit · Haven Gloom {snapshot.haven.gloom}</p>
      {run.chronicleFacts !== undefined && <>
        <h3>Chronicle facts</h3>
        <p>Road: {run.chronicleFacts.visitedNodes.map(titleCase).join(" → ")}</p>
        <p>Events: {run.chronicleFacts.eventChoices.map(titleCase).join(", ") || "None"}</p>
        <p>Injuries: {run.chronicleFacts.injuries.join(", ") || "None"}</p>
      </>}
    </section>
  </Page>;
}

interface ViewProps { snapshot: GameSnapshot; send: (type: CommandType, payload?: Record<string, unknown>, actorId?: string) => Promise<void>; }

function CurrentView(props: ViewProps) {
  const { snapshot } = props;
  if (snapshot.view === "haven" || snapshot.view === "postReturn") return <HavenView {...props} />;
  if (snapshot.view === "map") return <MapView {...props} />;
  if (snapshot.view === "combat") return <CombatView {...props} />;
  if (snapshot.view === "reward") return <RewardView {...props} />;
  if (snapshot.view === "event") return <ChoiceView {...props} kind="event" />;
  if (snapshot.view === "rest") return <ChoiceView {...props} kind="rest" />;
  if (snapshot.view === "craft") return <ChoiceView {...props} kind="craft" />;
  if (snapshot.view === "growth") return <GrowthView {...props} />;
  if (snapshot.view === "waypoint" || snapshot.view === "returnChoice") return <WaypointView {...props} />;
  return <TerminalView {...props} />;
}

export function App() {
  const { snapshot, loading, busy, error, facts, load, submit, clearError } = useNightfall();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(readSidebarPreference);
  const [sidebarOverride, setSidebarOverride] = useState<boolean | null>(null);
  const [partyOpen, setPartyOpen] = useState(false);
  useEffect(() => { void load(); }, [load]);
  useEffect(() => { setSidebarOverride(null); }, [snapshot?.view]);
  const recentFacts = useMemo(() => facts.slice(-5).reverse(), [facts]);
  if (loading) return <div className="splash"><span className="lantern-mark" />Reading the Pillarhouse ledger…</div>;
  if (snapshot === undefined) return <div className="splash error"><h1>The local host is dark</h1><p>{error}</p><button onClick={() => void load()}>Try again</button></div>;
  const inCombat = snapshot.view === "combat";
  const railCollapsed = sidebarOverride ?? (inCombat || sidebarCollapsed);
  const toggleSidebar = () => {
    const next = !railCollapsed;
    setSidebarOverride(next);
    if (!inCombat) {
      setSidebarCollapsed(next);
      writeSidebarPreference(next);
    }
  };
  return <div className={`app-shell is-stage${inCombat ? " is-combat" : ""}${railCollapsed ? " is-rail-collapsed" : ""}${partyOpen ? " is-party-open" : ""}`}>
    <aside className={`way-lantern${railCollapsed ? " is-collapsed" : ""}`} aria-label="Way lantern">
      <div className="lantern-top">
        <div className="brand">
          <span className="lantern-mark" aria-hidden="true" />
          <div className="brand-copy"><small>Vesper field ledger</small><strong>Nightfall</strong></div>
        </div>
        <button type="button" className="rail-toggle quiet" onClick={toggleSidebar} aria-expanded={!railCollapsed} aria-controls="way-lantern-body" title={railCollapsed ? "Expand sidebar" : "Collapse sidebar"}>
          {railCollapsed ? "»" : "«"}
        </button>
      </div>
      <div id="way-lantern-body" className="lantern-body" hidden={railCollapsed}>
        <PillarRail lit={snapshot.haven.litPillars} />
        <div className="save-state"><span className={busy ? "pulse" : ""} />{busy ? "Resolving…" : `Saved · revision ${snapshot.revision}`}</div>
        <button type="button" className={`party-launch${partyOpen ? " is-active" : ""}`} onClick={() => setPartyOpen(true)} aria-expanded={partyOpen}>
          Party & packs
        </button>
        {recentFacts.length > 0 && <section className="fact-log" aria-live="polite"><h2>What changed</h2>{recentFacts.map((fact) => <p key={fact.id}>{fact.message}</p>)}</section>}
      </div>
      {railCollapsed && <div className="lantern-rail">
        <div className="rail-pillars" title={`${snapshot.haven.litPillars} of 10 pillars lit`} aria-label={`${snapshot.haven.litPillars} of 10 Haven pillars lit`}>
          <strong>{snapshot.haven.litPillars}</strong><span>/10</span>
        </div>
        <div className="save-state rail-save" title={busy ? "Resolving…" : `Saved · revision ${snapshot.revision}`}>
          <span className={busy ? "pulse" : ""} />
        </div>
        <button type="button" className={`rail-party${partyOpen ? " is-active" : ""}`} onClick={() => setPartyOpen(true)} title="Party & packs" aria-label="Open party and packs" aria-expanded={partyOpen}>P</button>
      </div>}
    </aside>
    <div className="content"><CurrentView snapshot={snapshot} send={submit} /></div>
    <PartyPanel snapshot={snapshot} open={partyOpen} onClose={() => setPartyOpen(false)} />
    {error !== undefined && <div className="error-toast" role="alert"><span>{titleCase(error)}</span><button onClick={clearError} aria-label="Dismiss error">×</button></div>}
  </div>;
}

const SIDEBAR_PREF_KEY = "nightfall.wayLanternCollapsed";

function readSidebarPreference(): boolean {
  try { return globalThis.localStorage?.getItem(SIDEBAR_PREF_KEY) === "1"; } catch { return false; }
}

function writeSidebarPreference(collapsed: boolean): void {
  try { globalThis.localStorage?.setItem(SIDEBAR_PREF_KEY, collapsed ? "1" : "0"); } catch { /* ignore quota / private mode */ }
}
