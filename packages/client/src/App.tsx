import { useEffect, useMemo, useState, type ReactNode } from "react";
import type { CardInstanceSnapshot, CommandType, DecisionChoiceSnapshot, GameSnapshot, HeroSnapshot, ItemInstance } from "@nightfall/contracts";
import { useNightfall } from "./store.js";

const titleCase = (value: string) => value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

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

function Page({ eyebrow, title, intro, children }: { eyebrow: string; title: string; intro?: string; children: ReactNode }) {
  return <main className="page"><header className="page-heading"><span>{eyebrow}</span><h1>{title}</h1>{intro !== undefined && <p>{intro}</p>}</header>{children}</main>;
}

function HavenView({ snapshot, send }: ViewProps) {
  const [name, setName] = useState(snapshot.haven.name);
  const pendingLeadership = snapshot.haven.heroes.filter((hero) => hero.pendingLeadership > 0);
  return <Page eyebrow="Pillarhouse record" title={snapshot.haven.name} intro="The road is waiting. Everything committed to an expedition can be lost until it is sealed or brought home.">
    {snapshot.view === "postReturn" && <section className="homecoming-callout"><div><span>Homecoming ledger</span><strong>Returned holdings are banked. Review the Haven, then close this expedition.</strong></div><button className="primary" onClick={() => void send("continueToHaven")}>Finish homecoming</button></section>}
    <section className="haven-status"><div><PillarRail lit={snapshot.haven.litPillars} /><p><strong>{snapshot.haven.litPillars}/10 pillars</strong> · Haven Gloom {snapshot.haven.gloom} · Next embark {snapshot.haven.gloom * 4} Run Gloom</p></div><button className="primary" onClick={() => { if (globalThis.confirm("Commit both heroes and all equipped Haven gear to wipe risk?")) void send("commitEmbark"); }}>Embark on the Unlit Road</button></section>
    <section className="rename-line"><label>Haven name<input value={name} maxLength={40} onChange={(event) => setName(event.target.value)} /></label><button onClick={() => void send("nameHaven", { name })}>Record name</button></section>
    <div className="two-column"><section><h2>Expedition pair</h2><div className="hero-grid">{snapshot.haven.heroes.map((hero) => <HeroLedger hero={hero} key={hero.id} />)}</div></section><section><h2>Stores</h2><div className="resource-grid">{Object.entries(snapshot.haven.resources).map(([id, amount]) => <div key={id}><span>{titleCase(id)}</span><strong>{amount}</strong></div>)}</div><h2>Haven works</h2><div className="building-list">{snapshot.haven.buildings.map((building) => <article key={building.id}><div><strong>{titleCase(building.id)}</strong><span>{titleCase(building.state)}</span></div>{building.state === "available" && ["cinder_forge", "quiet_house", "wardyard"].includes(building.id) && <button onClick={() => { if (globalThis.confirm(`Construct ${titleCase(building.id)} with returned materials?`)) void send("buildBuilding", { buildingId: building.id }); }}>Construct</button>}</article>)}</div></section></div>
    {snapshot.haven.litPillars < 10 && snapshot.haven.resources.ember_shard > 0 && <button onClick={() => { if (globalThis.confirm("Spend one Ember Shard to relight a pillar permanently?")) void send("repairPillar"); }}>Relight one pillar</button>}
    {pendingLeadership.length > 0 && snapshot.haven.buildings.some((building) => building.id === "wardyard" && building.state === "built") && <section><h2>Wardyard Leadership</h2>{pendingLeadership.map((hero) => <div className="choice-row" key={hero.id}><strong>{hero.name}</strong>{(["vit", "dex", "str", "int"] as const).map((stat) => <button key={stat} onClick={() => { if (globalThis.confirm(`Permanently assign ${hero.name}'s Leadership Point to ${stat.toUpperCase()}?`)) void send("assignLeadership", { heroId: hero.id, stat }); }}>{stat.toUpperCase()}</button>)}</div>)}</section>}
    <section><h2>Haven-held gear and patterns</h2><ItemList items={snapshot.haven.holdings} empty="No spare holdings. Equipped starter gear is listed in each hero's sheet." /></section>
  </Page>;
}

function gloomBand(value: number) { return value < 40 ? "Held at Bay" : value < 70 ? "Encroaching" : value < 90 ? "Pressing" : "Overrun"; }

function MapView({ snapshot, send }: ViewProps) {
  const run = snapshot.activeRun!; const legal = run.edges.filter((edge) => edge.from === run.currentNodeId); const byId = new Map(run.nodes.map((node) => [node.id, node]));
  return <Page eyebrow="Expedition leg" title="The Unlit Road" intro="The route was fixed when you embarked. Event identity stays under fog until entered; every edge adds exactly 5 Gloom.">
    <section className="gloom-banner"><div><span>Run Gloom</span><strong>{run.runGloom}</strong></div><div><span>Pressure</span><strong>{gloomBand(run.runGloom)}</strong></div><div><span>Next edge</span><strong>+5</strong></div></section>
    <section className="route-strip" aria-label="Visited route">{run.visitedNodeIds.map((id, index) => <span key={`${id}-${index}`}>{byId.get(id)?.label ?? titleCase(id)}</span>)}</section>
    <section><h2>Choose the next road</h2><div className="road-choices">{legal.map((edge) => { const node = byId.get(edge.to)!; return <button key={edge.id} onClick={() => void send("chooseMapEdge", { edgeId: edge.id })}><span>{node.visibility === "hidden" ? "Unknown event" : titleCase(node.type)}</span><strong>{node.label}</strong><small>Travel · +5 Run Gloom</small></button>; })}</div></section>
    <section><h2>Party state</h2><div className="hero-grid">{run.heroes.map((hero) => <HeroLedger hero={hero} key={hero.id} />)}</div></section>
  </Page>;
}

function TargetedCard({ card, snapshot, actorId, onPlay }: { card: CardInstanceSnapshot; snapshot: GameSnapshot; actorId: string; onPlay: (targetId?: string) => void }) {
  const combat = snapshot.activeRun!.combat!; const targets = card.presentation.targetSpec === "ally" ? combat.combatants.filter((entry) => entry.side === "heroes" && !entry.downed) : combat.combatants.filter((entry) => entry.side === "enemies" && !entry.destroyed && entry.targetable);
  const needsTarget = card.presentation.targetSpec === "ally" || card.presentation.targetSpec === "enemy";
  const [target, setTarget] = useState(targets[0]?.id ?? "");
  return <article className="action-card"><div><small>{card.presentation.apCost} AP{card.presentation.manaCost > 0 ? ` · ${card.presentation.manaCost} Mana` : ""}{card.presentation.staminaCost > 0 ? ` · ${card.presentation.staminaCost} Stamina` : ""}</small><h3>{card.presentation.name}</h3><p>{card.presentation.summary}</p></div>{needsTarget && <label>Target<select value={target} onChange={(event) => setTarget(event.target.value)}>{targets.map((entry) => <option key={entry.id} value={entry.id}>{entry.name}</option>)}</select></label>}<button onClick={() => onPlay(needsTarget ? target : undefined)} disabled={actorId !== card.ownerId || (needsTarget && target === "")}>Play</button></article>;
}

function CombatView({ snapshot, send }: ViewProps) {
  const run = snapshot.activeRun!; const combat = run.combat!; const active = combat.combatants.find((entry) => entry.id === combat.activeCombatantId)!; const activeResources = combat.heroResources.find((entry) => entry.heroId === active.id); const hand = combat.cards.filter((card) => card.ownerId === active.id && card.zone === "hand"); const enemies = combat.combatants.filter((entry) => entry.side === "enemies" && !entry.destroyed); const basics = combat.basicActions.find((entry) => entry.heroId === active.id);
  return <Page eyebrow={`Combat · round ${combat.round}`} title={run.nodes.find((node) => node.id === run.currentNodeId)?.label ?? titleCase(combat.encounterId)} intro="The timeline and every normal enemy intent are already resolved. Your commands change the authoritative snapshot; the screen never predicts an outcome.">
    <section className="turn-banner"><div><span>Current actor</span><strong>{active.name}</strong></div><div><span>Action points</span><strong>{activeResources?.ap ?? "—"}</strong></div><div><span>Run Gloom</span><strong>{run.runGloom}</strong></div></section>
    <ol className="timeline" aria-label="Complete initiative timeline">{combat.timeline.map((id) => { const entry = combat.combatants.find((candidate) => candidate.id === id); if (entry === undefined || entry.destroyed) return null; const intent = combat.intents.find((candidate) => candidate.enemyId === id); return <li key={id} className={id === active.id ? "active" : ""}><b>{entry.initiative}</b><span>{entry.name}</span>{intent !== undefined && <small>{intent.label} · {intent.targetLabel} · {intent.magnitude}</small>}</li>; })}</ol>
    <div className="combat-grid"><section><h2>Hostiles and intent</h2>{enemies.map((enemy) => { const intent = combat.intents.find((entry) => entry.enemyId === enemy.id); const block = enemy.blockLayers.reduce((sum, layer) => sum + layer.amount, 0); return <article className="enemy-card" key={enemy.id}><div><small>{enemy.kind === "entity" ? "Urgent target" : "Visible intent"}</small><h3>{enemy.name}</h3></div><Meter label="HP" value={enemy.hp} max={enemy.maxHp} tone="gloom" />{block > 0 && <p>Block {block}</p>}{intent !== undefined && <p><strong>{intent.label}</strong><br />{intent.targetLabel} · magnitude {intent.magnitude}</p>}</article>; })}</section><section><h2>Expedition pair</h2>{run.heroes.map((hero) => <HeroLedger hero={hero} key={hero.id} />)}</section></div>
    {active.side === "heroes" && <section><h2>Choose {active.name}'s action</h2><div className="basic-row">{basics !== undefined && <><button onClick={() => void send("useBasicAttack", { targetId: enemies[0]?.id }, active.id)} disabled={enemies.length === 0}>{basics.attack.name} · 1 AP</button><button onClick={() => void send("useBasicBlock", {}, active.id)}>{basics.block.name} · 1 AP</button></>}<button className="quiet" onClick={() => void send("endTurn", {}, active.id)}>End turn</button></div><div className="hand-grid">{hand.map((card) => <TargetedCard key={card.cardInstanceId} card={card} snapshot={snapshot} actorId={active.id} onPlay={(targetId) => void send("playCard", { cardInstanceId: card.cardInstanceId, ...(targetId === undefined ? {} : { targetId }) }, active.id)} />)}</div><p className="zone-counts">Draw {combat.cards.filter((card) => card.ownerId === active.id && card.zone === "draw").length} · Discard {combat.cards.filter((card) => card.ownerId === active.id && card.zone === "discard").length} · Exhaust {combat.cards.filter((card) => card.ownerId === active.id && card.zone === "exhaust").length}</p></section>}
  </Page>;
}

function ItemList({ items, empty }: { items: readonly ItemInstance[]; empty: string }) {
  if (items.length === 0) return <p className="empty">{empty}</p>;
  return <div className="item-list">{items.map((item) => <article key={item.instanceId}><div><small>{titleCase(item.rarityId)} · {titleCase(item.location.kind)}</small><strong>{item.displaySnapshot.name}</strong><p>{item.displaySnapshot.description}</p></div>{item.curseId !== undefined && <span className="warning">{titleCase(item.curseId)}</span>}</article>)}</div>;
}

function RewardView({ snapshot, send }: ViewProps) {
  const decision = snapshot.activeRun!.pendingDecision; if (decision?.kind !== "reward") return null;
  return <Page eyebrow="Recovered opportunity" title="Choose what the road gives back" intro="The automatic bundle is already secured—but still carried at risk. Choose one fully identified offer."><section className="bundle"><strong>Automatic bundle</strong><span>{Object.entries(decision.automatic).map(([id, amount]) => `${amount} ${titleCase(id)}`).join(" · ")}</span></section><div className="reward-grid">{decision.offers.map((offer) => <article key={offer.id}><small>{titleCase(offer.item.rarityId)} · {titleCase(offer.kind)}</small><h2>{offer.item.displaySnapshot.name}</h2><p>{offer.item.displaySnapshot.description}</p><p>Carried — at risk until Return or chest sealing.</p><button onClick={() => void send("chooseReward", { offerId: offer.id })}>Take {offer.item.displaySnapshot.name}</button></article>)}</div>{decision.sourceId !== "lantern_smother" && <button className="quiet" onClick={() => void send("leaveReward")}>Leave both offers</button>}</Page>;
}

function ChoiceView({ snapshot, send, kind }: ViewProps & { kind: "event" | "rest" | "craft" }) {
  const decision = snapshot.activeRun!.pendingDecision; if (decision?.kind !== kind) return null;
  const heading = decision.kind === "event" ? titleCase(decision.eventId) : decision.kind === "rest" ? "Rest at the last light" : "Safe craft";
  const intro = decision.kind === "rest" ? `Base −12 Gloom · modifier ${decision.modifier >= 0 ? "+" : ""}${decision.modifier} · effective −${decision.baseGloomReduction - decision.modifier}` : "Every cost and probability below is resolved by the host's named stream.";
  const firstGear = snapshot.activeRun!.holdings.find((item) => item.itemKind === "equipment" && item.location.kind !== "lost" && item.location.kind !== "consumed"); const heroId = snapshot.activeRun!.heroes[0]?.id;
  const choose = (choice: DecisionChoiceSnapshot) => {
    if (decision.kind === "event") void send("chooseEventOption", { optionId: choice.id, ...(firstGear === undefined ? {} : { targetItemId: firstGear.instanceId }) });
    else if (decision.kind === "rest") void send("chooseRestOption", { optionId: choice.id, heroId });
    else if (globalThis.confirm(`Consume the disclosed inputs for ${choice.label}?`)) void send("chooseCraftRecipe", { recipeId: choice.id, heroId, ...(firstGear === undefined ? {} : { targetItemId: firstGear.instanceId }) });
  };
  return <Page eyebrow={kind === "event" ? "Unresolved memory" : "Preparation moment"} title={heading} intro={intro}><div className="choice-grid">{decision.choices.map((choice) => <article key={choice.id}><h2>{choice.label}</h2><p>{choice.detail}</p><button onClick={() => choose(choice)}>Choose {choice.label}</button></article>)}</div></Page>;
}

function GrowthView({ snapshot, send }: ViewProps) {
  const decision = snapshot.activeRun!.pendingDecision; if (decision?.kind !== "temporary_growth") return null;
  return <Page eyebrow="Expedition growth" title="The road changes its survivors" intro="Each point lasts for this expedition only and fades on Return.">{decision.heroIds.map((id) => { const hero = snapshot.activeRun!.heroes.find((entry) => entry.id === id)!; return <section className="growth-row" key={id}><HeroLedger hero={hero} /><div>{(["vit", "dex", "str", "int"] as const).map((stat) => <button key={stat} onClick={() => void send("assignTemporaryStat", { heroId: id, stat })}>+1 {stat.toUpperCase()}</button>)}</div></section>; })}</Page>;
}

function WaypointView({ snapshot, send }: ViewProps) {
  const run = snapshot.activeRun!; const held = run.holdings.filter((item) => ["equipment", "scroll", "ember_shard"].includes(item.itemKind) && item.location.kind === "held_by_expedition"); const edges = run.edges.filter((edge) => edge.from === "waypoint");
  return <Page eyebrow="Permanent ground claimed" title="Whisperwood Waypoint" intro="The waypoint, settlement trace, and Ember Vault blueprint are already permanent. Physical rewards still need protection or a successful Return."><section className="waypoint-ledger"><div><strong>Chest</strong><span>{run.waypointChest.length}/3 sealed slots</span></div><div><strong>Ember Shards carried</strong><span>{run.materials.ember_shard}</span></div></section>{snapshot.haven.litPillars < 10 && run.materials.ember_shard > 0 && <button onClick={() => { if (globalThis.confirm("Spend one Ember Shard now? This repair remains even if the Return wipes.")) void send("spendEmberShardRite"); }}>Perform remote pillar rite</button>}<section><h2>Seal carried value</h2><ItemList items={run.waypointChest} empty="No item sealed yet." />{held.map((item) => <button key={item.instanceId} onClick={() => { if (globalThis.confirm(`Seal ${item.displaySnapshot.name}? It cannot be used on the Return leg.`)) void send("sealChestItem", { itemId: item.instanceId }); }}>Seal {item.displaySnapshot.name}</button>)}</section><section><h2>Choose the one Return leg</h2><div className="road-choices">{edges.map((edge) => <button key={edge.id} onClick={() => void send("chooseReturnEdge", { edgeId: edge.id })}><strong>{titleCase(edge.to)}</strong><small>Travel · +5 Run Gloom</small></button>)}</div></section></Page>;
}

function TerminalView({ snapshot, send }: ViewProps) {
  const run = snapshot.activeRun!; const result = run.terminalResult!; const title = result === "return" ? "They came home" : result === "succession" ? "A new light is named" : "The road kept their names";
  return <Page eyebrow={titleCase(result)} title={title} intro={result === "return" ? "Recovered holdings are banked once. Temporary growth faded; Leadership now waits at the Wardyard." : "Unsealed expedition holdings and the committed party are lost. Protected and permanent world facts remain exactly where the ledger says."}><section className="terminal-ledger"><PillarRail lit={snapshot.haven.litPillars} /><h2>{snapshot.haven.name}</h2><p>{snapshot.haven.litPillars}/10 pillars lit · Haven Gloom {snapshot.haven.gloom}</p>{run.chronicleFacts !== undefined && <><h3>Chronicle facts</h3><p>Road: {run.chronicleFacts.visitedNodes.map(titleCase).join(" → ")}</p><p>Events: {run.chronicleFacts.eventChoices.map(titleCase).join(", ") || "None"}</p><p>Injuries: {run.chronicleFacts.injuries.join(", ") || "None"}</p></>}<button className="primary" onClick={() => void send("continueToHaven")}>{snapshot.view === "returnResults" ? "Review Haven decisions" : "Continue to the Haven"}</button></section></Page>;
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
  useEffect(() => { void load(); }, [load]);
  const recentFacts = useMemo(() => facts.slice(-5).reverse(), [facts]);
  if (loading) return <div className="splash"><span className="lantern-mark" />Reading the Pillarhouse ledger…</div>;
  if (snapshot === undefined) return <div className="splash error"><h1>The local host is dark</h1><p>{error}</p><button onClick={() => void load()}>Try again</button></div>;
  return <div className="app-shell">
    <aside className="way-lantern"><div className="brand"><span className="lantern-mark" /><div><small>Vesper field ledger</small><strong>Nightfall</strong></div></div><PillarRail lit={snapshot.haven.litPillars} /><div className="save-state"><span className={busy ? "pulse" : ""} />{busy ? "Resolving…" : `Saved · revision ${snapshot.revision}`}</div>{recentFacts.length > 0 && <section className="fact-log" aria-live="polite"><h2>What changed</h2>{recentFacts.map((fact) => <p key={fact.id}>{fact.message}</p>)}</section>}</aside>
    <div className="content"><CurrentView snapshot={snapshot} send={submit} /></div>
    {error !== undefined && <div className="error-toast" role="alert"><span>{titleCase(error)}</span><button onClick={clearError} aria-label="Dismiss error">×</button></div>}
  </div>;
}
