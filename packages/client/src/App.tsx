import { useEffect, useMemo, useState, type ReactNode } from "react";
import type { CommandType, DecisionChoiceSnapshot, GameSnapshot, HeroSnapshot, ItemInstance } from "@nightfall/contracts";
import {
  affordability,
  choiceConfirmSummary,
  choicePresentation,
  choiceRiskLabel,
  costLabel,
  gloomPressure,
  humanizeEventChoice,
  learnableScrolls,
  relevantMaterials,
  titleCase
} from "./decisionUi.js";
import { RouteMapBoard } from "./map/RouteMapBoard.js";
import { CombatView } from "./combat/CombatView.js";
import { EQUIP_SLOTS, itemById } from "./party/inventoryUi.js";
import { PartyInventory } from "./party/PartyInventory.js";
import {
  deckInjectLines,
  equipCompareRows,
  needsRareLeaveConfirm,
  parseEffectSections,
  rarityClassName,
  rarityEyebrow,
  rarityGlyph,
  resolveCarrierItem,
  packAndSealedCounts,
  affixCountSummary
} from "./rewardUi.js";
import { presentLootFact } from "./lootFactUi.js";
import { carrierRecoveredAnnouncement } from "./combat/carrierChaseUi.js";
import { buildingCost, canAffordBuilding, CONSTRUCTIBLE_BUILDING_IDS } from "./havenBuildUi.js";
import { useNightfall } from "./store.js";
import { FoundingScreen, MismatchScreen, NewCampaignConfirm, TitleScreen } from "./IdentityScreens.js";

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
  const [embarkOpen, setEmbarkOpen] = useState(false);
  const pendingLeadership = snapshot.haven.heroes.filter((hero) => hero.pendingLeadership > 0);
  const wardyardBuilt = snapshot.haven.buildings.some((building) => building.id === "wardyard" && building.state === "built");
  const waypoints = snapshot.campaign.claimedWaypointIds;
  const wick = snapshot.haven.resources.wick;
  const equipped = snapshot.haven.heroes.flatMap((hero) => EQUIP_SLOTS
    .map((slot) => itemById(snapshot.haven.holdings, hero.equipment[slot]))
    .filter((item): item is ItemInstance => item !== undefined)
    .map((item) => ({ hero: hero.name, item })));
  return <Page
    eyebrow="Pillarhouse record"
    title={snapshot.haven.name}
    intro="Everything committed to an expedition can be lost until sealed or brought home."
    aside={<button className="primary" onClick={() => setEmbarkOpen(true)}>Embark</button>}
  >
    {snapshot.view === "postReturn" && <section className="homecoming-callout"><div><span>Homecoming ledger</span><strong>Returned holdings are banked. Review the Haven, then close this expedition.</strong></div><button className="primary" onClick={() => void send("continueToHaven")}>Finish homecoming</button></section>}
    <section className="haven-status">
      <div>
        <PillarRail lit={snapshot.haven.litPillars} />
        <p><strong>{snapshot.haven.litPillars}/10 pillars</strong> · Haven Gloom {snapshot.haven.gloom} · Next embark {snapshot.haven.gloom * 4} Run Gloom · Torches (wick) {wick}</p>
        <p className="stat-line">Claimed waypoints {waypoints.length}{waypoints.length > 0 ? `: ${waypoints.map(titleCase).join(", ")}` : ""}</p>
      </div>
      <section className="rename-line"><label>Haven name<input value={name} maxLength={40} onChange={(event) => setName(event.target.value)} /></label><button onClick={() => void send("nameHaven", { name })}>Record name</button></section>
    </section>
    <div className="haven-layout">
      <div className="two-column">
        <section className="stage-panel">
          <h2>Expedition pair</h2>
          <div className="hero-grid">{snapshot.haven.heroes.map((hero) => <HeroLedger hero={hero} key={hero.id} />)}</div>
        </section>
        <section className="stage-panel">
          <h2>Stores</h2>
          <div className="resource-grid">{Object.entries(snapshot.haven.resources).map(([id, amount]) => <div key={id}><span>{titleCase(id)}</span><strong>{amount}</strong></div>)}</div>
          <h2>Haven works</h2>
          <div className="building-list">{snapshot.haven.buildings.map((building) => {
            const cost = building.state === "available" && CONSTRUCTIBLE_BUILDING_IDS.includes(building.id) ? buildingCost(building.id) : undefined;
            const affordable = cost !== undefined && canAffordBuilding(snapshot.haven.resources, cost);
            const costText = cost === undefined ? undefined : costLabel(cost);
            return <article key={building.id}>
              <div>
                <strong>{titleCase(building.id)}</strong>
                <span>{titleCase(building.state)}</span>
                {costText !== undefined && <span>{costText}</span>}
              </div>
              {cost !== undefined && <button
                disabled={!affordable}
                title={affordable ? `Construct for ${costText}` : `Need ${costText}`}
                onClick={() => { if (globalThis.confirm(`Construct ${titleCase(building.id)} for ${costText}?`)) void send("buildBuilding", { buildingId: building.id }); }}
              >Construct</button>}
            </article>;
          })}</div>
          {snapshot.haven.litPillars < 10 && snapshot.haven.resources.ember_shard > 0 && <button className="haven-inline-action" onClick={() => { if (globalThis.confirm("Spend one Ember Shard to relight a pillar permanently?")) void send("repairPillar"); }}>Relight one pillar</button>}
        </section>
      </div>
      {pendingLeadership.length > 0 && !wardyardBuilt && <section className="stage-panel leadership-teaser"><h2>Leadership waiting</h2><p>{pendingLeadership.map((hero) => `${hero.name} (+${hero.pendingLeadership})`).join(" · ")} — construct the Wardyard to assign permanent attributes.</p></section>}
      {pendingLeadership.length > 0 && wardyardBuilt && <section className="stage-panel"><h2>Wardyard Leadership</h2>{pendingLeadership.map((hero) => <div className="choice-row" key={hero.id}><strong>{hero.name}</strong>{(["vit", "dex", "str", "int"] as const).map((stat) => <button key={stat} onClick={() => { if (globalThis.confirm(`Permanently assign ${hero.name}'s Leadership Point to ${stat.toUpperCase()}?`)) void send("assignLeadership", { heroId: hero.id, stat }); }}>{stat.toUpperCase()}</button>)}</div>)}</section>}
      <section className="stage-panel">
        <h2>Haven-held gear and patterns</h2>
        <ItemList items={snapshot.haven.holdings.filter((item) => item.location.kind === "haven" || item.location.kind === "equipped")} empty="No spare holdings. Equipped starter gear is listed in each hero's sheet." />
      </section>
    </div>
    {embarkOpen && <div className="embark-sheet" role="dialog" aria-modal="true" aria-label="Embark confirmation">
      <div className="embark-sheet-card">
        <header>
          <span>Wipe-risk commitment</span>
          <h2>Embark The Unlit Road</h2>
          <p>Both survivors and all equipped Haven gear enter wipe risk until sealed at a waypoint or brought home.</p>
        </header>
        <section>
          <h3>Committed pair</h3>
          <ul>{snapshot.haven.heroes.map((hero) => <li key={hero.id}><strong>{hero.name}</strong> · {titleCase(hero.classId)} · HP {hero.hp}/{hero.maxHp}</li>)}</ul>
        </section>
        <section>
          <h3>Equipped into risk</h3>
          {equipped.length === 0 ? <p className="empty">No gear currently equipped.</p> : <ul>{equipped.map(({ hero, item }) => <li key={item.instanceId}><strong>{item.displaySnapshot.name}</strong> on {hero}</li>)}</ul>}
        </section>
        <section>
          <h3>Starting Run Gloom</h3>
          <p>{snapshot.haven.gloom * 4} (Haven Gloom × 4). Every road edge adds +5.</p>
        </section>
        <footer className="embark-actions">
          <button type="button" className="quiet" onClick={() => setEmbarkOpen(false)}>Cancel</button>
          <button type="button" className="primary" onClick={() => { setEmbarkOpen(false); void send("commitEmbark"); }}>Commit embark</button>
        </footer>
      </div>
    </div>}
  </Page>;
}

function MapView({ snapshot, send }: ViewProps) {
  const run = snapshot.activeRun!;
  const pressure = gloomPressure(run.runGloom);
  const boss = run.nodes.find((node) => node.type === "boss");
  return <Page
    eyebrow="Expedition leg"
    title="The Unlit Road"
    intro="Walk the branching road. Event identity stays under fog until entered. Every edge adds exactly +5 Run Gloom."
    aside={<div className="stage-stat-row" aria-label="Run pressure">
      <div><span>Run Gloom</span><strong>{run.runGloom}</strong></div>
      <div><span>Pressure</span><strong>{pressure.band}</strong></div>
      <div><span>Next edge</span><strong>+5</strong></div>
    </div>}
  >
    <p className="gloom-next-line" role="status">{pressure.nextEffect}{boss !== undefined ? ` · Path continues toward ${boss.label}.` : ""}</p>
    <div className="map-layout">
      <RouteMapBoard run={run} onChooseEdge={(edgeId) => void send("chooseMapEdge", { edgeId })} />
      <section className="stage-panel map-party-panel">
        <h2>Party state</h2>
        <div className="hero-grid">{run.heroes.map((hero) => <HeroLedger hero={hero} key={hero.id} />)}</div>
      </section>
    </div>
  </Page>;
}

function ItemEffects({ description, omitInject = false }: { description: string; omitInject?: boolean }) {
  const sections = parseEffectSections(description, { omitInject });
  if (sections.length === 0) return null;
  return <div className="item-effect-sections" aria-label="Item effects">
    {sections.map((section) => (
      <section
        key={section.id}
        className={`item-effect-section is-section-${section.id}${section.id === "curse" ? " item-curse-chrome" : ""}`}
      >
        <h4 className="item-effect-section-title">{section.title}</h4>
        {section.lines.length === 1
          ? <p className={section.id === "curse" ? "item-curse-line" : "offer-effect-lead"}>{section.lines[0]}</p>
          : <ul className="offer-effects" aria-label={section.title}>{section.lines.map((line) => <li key={line}>{line}</li>)}</ul>}
      </section>
    ))}
  </div>;
}

function DeckInjectCallout({ description }: { description: string }) {
  const lines = deckInjectLines(description);
  if (lines.length === 0) return null;
  return <div className="deck-inject-callout" role="status">
    {lines.map((line) => <p key={line}>{line}</p>)}
  </div>;
}

function IdentifiedItemCard({
  item,
  eyebrow,
  compareLines,
  children
}: {
  item: ItemInstance;
  eyebrow: string;
  compareLines?: readonly string[];
  children?: ReactNode;
}) {
  const cursed = item.curseId !== undefined;
  return <article className={`offer-card ${rarityClassName(item.rarityId)}${cursed ? " is-cursed" : ""}`}>
    <small>
      <span className="rarity-glyph" aria-hidden="true">{rarityGlyph(item.rarityId)}</span>
      {" "}{eyebrow}
    </small>
    <h2>{item.displaySnapshot.name}</h2>
    <DeckInjectCallout description={item.displaySnapshot.description} />
    <ItemEffects description={item.displaySnapshot.description} omitInject />
    {compareLines !== undefined && compareLines.length > 0 && <ul className="equip-compare" aria-label="Compared to equipped">
      {compareLines.map((line) => <li key={line}>{line}</li>)}
    </ul>}
    <p className="ownership-tag">Carried — at risk</p>
    {children}
  </article>;
}

function ItemList({ items, empty }: { items: readonly ItemInstance[]; empty: string }) {
  if (items.length === 0) return <p className="empty">{empty}</p>;
  return <div className="item-list">{items.map((item) => <article key={item.instanceId} className={`${rarityClassName(item.rarityId)}${item.curseId !== undefined ? " is-cursed" : ""}`}><div><small><span className="rarity-glyph" aria-hidden="true">{rarityGlyph(item.rarityId)}</span> {titleCase(item.rarityId)} · {affixCountSummary(item)} · {titleCase(item.location.kind)}</small><strong>{item.displaySnapshot.name}</strong><ItemEffects description={item.displaySnapshot.description} /></div></article>)}</div>;
}

function RewardView({ snapshot, send }: ViewProps) {
  const run = snapshot.activeRun!;
  const decision = run.pendingDecision; if (decision?.kind !== "reward") return null;
  const needsConfirm = needsRareLeaveConfirm(decision.offers);
  const heroes = run.heroes;
  const holdings = run.holdings;
  const counts = packAndSealedCounts(run);
  const carrier = resolveCarrierItem(run, decision.carrierItemId);
  const leave = () => {
    if (needsConfirm && !globalThis.confirm("Leave these offers? A Rare-or-better item will be gone for this expedition.")) return;
    void send("leaveReward");
  };
  return <Page
    eyebrow="Recovered opportunity"
    title="Choose what the road gives back"
    intro="The automatic bundle is already secured—but still carried at risk. Choose one fully identified offer, or equip from Party & packs after taking it."
  >
    <section className="decision-state-strip" aria-label="Carried at risk">
      <div className="decision-state-head">
        <span className="ownership-tag">Carried — at risk</span>
        <p className="decision-gloom" role="status">Run Gloom <strong>{run.runGloom}</strong></p>
      </div>
      <p className="stat-line">Pack {counts.pack} · Sealed at waypoint {counts.sealed}</p>
    </section>
    <section className="bundle"><strong>Automatic bundle</strong><span>{Object.entries(decision.automatic).map(([id, amount]) => `${amount} ${titleCase(id)}`).join(" · ")}</span></section>
    {carrier !== undefined && <div className="reward-carrier is-carrier-fanfare" aria-label="Marked carrier item">
      <p className="carrier-fanfare-line" role="status" aria-live="polite">{carrierRecoveredAnnouncement(carrier)}</p>
      <IdentifiedItemCard item={carrier} eyebrow={rarityEyebrow(carrier, "Marked carrier")} />
    </div>}
    {decision.carrierItemId !== undefined && carrier === undefined && <p className="carrier-note">A marked carrier dropped an exceptional item into the expedition pack.</p>}
    <div className="reward-grid">{decision.offers.map((offer) => {
      const compare = offer.kind === "item"
        ? equipCompareRows(offer.item, heroes, holdings).map((row) => row.line)
        : [];
      return <IdentifiedItemCard
        key={offer.id}
        item={offer.item}
        eyebrow={rarityEyebrow(offer.item, titleCase(offer.kind))}
        compareLines={compare}
      >
        <button onClick={() => void send("chooseReward", { offerId: offer.id })}>Take {offer.item.displaySnapshot.name}</button>
        {offer.kind === "item" && <div className="reward-equip-row">{heroes.map((hero) => <button key={hero.id} type="button" className="quiet" onClick={() => {
          void (async () => {
            await send("chooseReward", { offerId: offer.id });
            await send("equipItem", { heroId: hero.id, itemId: offer.item.instanceId });
          })();
        }}>Take & equip on {hero.name}</button>)}</div>}
      </IdentifiedItemCard>;
    })}</div>
    {decision.sourceId !== "lantern_smother" && <button className="quiet leave-action" onClick={leave}>Leave both offers</button>}
  </Page>;
}

function ChoiceStackSections({ choice }: { choice: DecisionChoiceSnapshot }) {
  const presentation = choicePresentation(choice);
  return <>
    <dl className="choice-stack">
      <div><dt>Cost</dt><dd>{presentation.cost}</dd></div>
      {presentation.outcomes.length > 0 && <div><dt>Outcome</dt><dd><ul>{presentation.outcomes.map((line) => <li key={line}>{line}</li>)}</ul></dd></div>}
      <div><dt>Odds</dt><dd><ul>{presentation.odds.map((line) => <li key={line}>{line}</li>)}</ul></dd></div>
    </dl>
  </>;
}

function ChoiceView({ snapshot, send, kind }: ViewProps & { kind: "event" | "rest" | "craft" }) {
  const run = snapshot.activeRun!;
  const decision = run.pendingDecision;
  const gearOptions = useMemo(
    () => run.holdings.filter((item) => item.itemKind === "equipment" && item.location.kind !== "lost" && item.location.kind !== "consumed"),
    [run.holdings]
  );
  const [heroId, setHeroId] = useState(run.heroes[0]?.id ?? "");
  const [itemId, setItemId] = useState(gearOptions[0]?.instanceId ?? "");
  const [pendingRisky, setPendingRisky] = useState<DecisionChoiceSnapshot | null>(null);

  useEffect(() => {
    if (!run.heroes.some((hero) => hero.id === heroId)) setHeroId(run.heroes[0]?.id ?? "");
  }, [run.heroes, heroId]);
  useEffect(() => {
    if (!gearOptions.some((item) => item.instanceId === itemId)) setItemId(gearOptions[0]?.instanceId ?? "");
  }, [gearOptions, itemId]);
  useEffect(() => {
    setPendingRisky(null);
  }, [decision?.kind, snapshot.revision]);

  if (decision?.kind !== kind) return null;
  const heading = decision.kind === "event"
    ? titleCase(decision.eventId)
    : decision.kind === "rest"
      ? "Rest at the last light"
      : "Ruined forge";
  const effectiveRest = decision.kind === "rest" ? decision.baseGloomReduction - decision.modifier : 0;
  const intro = decision.kind === "rest"
    ? `Run Gloom ${run.runGloom} → ${Math.max(0, run.runGloom - effectiveRest)} · base −${decision.baseGloomReduction} · modifier ${decision.modifier >= 0 ? "+" : ""}${decision.modifier}`
    : decision.kind === "craft"
      ? "Costs and odds below are fixed before you confirm. Leaving the forge spends no inputs."
      : "Each option lists its exact cost, consequence, and chance bands before you choose.";
  const pressure = gloomPressure(run.runGloom);
  const materials = relevantMaterials(run, decision.choices);
  const submitEvent = (choice: DecisionChoiceSnapshot) => {
    void send("chooseEventOption", { optionId: choice.id, ...(choice.needsItemTarget ? { targetItemId: itemId } : {}) });
    setPendingRisky(null);
  };
  const choose = (choice: DecisionChoiceSnapshot) => {
    const check = affordability(run, choice.cost);
    if (!check.ok) return;
    if (choice.needsHeroTarget && heroId === "") return;
    if (choice.needsItemTarget && itemId === "") return;
    if (decision.kind === "event") {
      if (choice.riskTier === "risky") {
        setPendingRisky(choice);
        return;
      }
      submitEvent(choice);
      return;
    }
    if (decision.kind === "rest") {
      void send("chooseRestOption", { optionId: choice.id, ...(choice.needsHeroTarget ? { heroId } : {}) });
      return;
    }
    if (!globalThis.confirm(`Consume ${costLabel(choice.cost)} for ${choice.label}?`)) return;
    void send("chooseCraftRecipe", {
      recipeId: choice.id,
      ...(choice.needsHeroTarget ? { heroId } : {}),
      ...(choice.needsItemTarget ? { targetItemId: itemId } : {})
    });
  };

  const needsHero = decision.choices.some((choice) => choice.needsHeroTarget);
  const needsItem = decision.choices.some((choice) => choice.needsItemTarget);

  return <Page eyebrow={kind === "event" ? "Unresolved memory" : "Preparation moment"} title={heading} intro={intro}>
    <section className="decision-state-strip" aria-label="Carried at risk">
      <div className="decision-state-head">
        <span className="ownership-tag">Carried — at risk</span>
        <p className="decision-gloom" role="status">Run Gloom <strong>{run.runGloom}</strong> · {pressure.band}</p>
      </div>
      <div className="decision-party-peek" aria-label="Party">
        {run.heroes.map((hero) => <div key={hero.id} className="decision-hero-chip">
          <strong>{hero.name}</strong>
          <span>HP {hero.hp}/{hero.maxHp}</span>
          {hero.injuries.length > 0 && <span className="warning">{hero.injuries.map(titleCase).join(", ")}</span>}
        </div>)}
      </div>
      {materials.length > 0 && <div className="party-materials is-relevant" aria-label="Relevant materials">{materials.map(({ id, amount }) => <div key={id}><span>{titleCase(id)}</span><strong>{amount}</strong></div>)}</div>}
      <p className="stat-line">Scrolls carried {learnableScrolls(snapshot).length} · Gear available {gearOptions.length}</p>
      {(needsHero || needsItem) && <div className="decision-targets">
        {needsHero && <label>Hero
          <select value={heroId} onChange={(event) => setHeroId(event.target.value)}>
            {run.heroes.map((hero) => <option key={hero.id} value={hero.id}>{hero.name} · HP {hero.hp}/{hero.maxHp}{hero.injuries.length > 0 ? ` · ${hero.injuries.map(titleCase).join(", ")}` : ""}</option>)}
          </select>
        </label>}
        {needsItem && <label>Target gear
          <select value={itemId} onChange={(event) => setItemId(event.target.value)}>
            {gearOptions.length === 0 ? <option value="">No gear available</option> : gearOptions.map((item) => <option key={item.instanceId} value={item.instanceId}>{item.displaySnapshot.name}</option>)}
          </select>
        </label>}
      </div>}
    </section>
    {pendingRisky !== null && <section className="decision-confirm" role="alertdialog" aria-labelledby="risky-confirm-title" aria-describedby="risky-confirm-body">
      <div>
        <h2 id="risky-confirm-title">Confirm risky choice</h2>
        <p id="risky-confirm-body" className="sr-only">{choiceConfirmSummary(pendingRisky)}</p>
        <p className="decision-confirm-label">{pendingRisky.label}</p>
        <ChoiceStackSections choice={pendingRisky} />
      </div>
      <div className="decision-confirm-actions">
        <button type="button" className="quiet" onClick={() => setPendingRisky(null)}>Cancel</button>
        <button type="button" className="primary" onClick={() => submitEvent(pendingRisky)}>Proceed</button>
      </div>
    </section>}
    <div className="choice-grid">{decision.choices.map((choice) => {
      const check = affordability(run, choice.cost);
      const risk = choiceRiskLabel(choice);
      const disabled = pendingRisky !== null || !check.ok || (choice.needsHeroTarget && heroId === "") || (choice.needsItemTarget && itemId === "");
      return <article key={choice.id} className={`offer-card choice-offer${disabled ? " is-disabled" : ""}`}>
        <div className="offer-meta">
          {risk !== undefined && <small className={`risk-tag is-${choice.riskTier}`}>{risk}</small>}
          {risk === undefined && kind === "event" && <small className="risk-tag is-safe">Guaranteed</small>}
        </div>
        <h2>{choice.label}</h2>
        <ChoiceStackSections choice={choice} />
        {!check.ok && <p className="warning">{check.missing.join(" · ")}</p>}
        <button disabled={disabled} onClick={() => choose(choice)}>Choose {choice.label}</button>
      </article>;
    })}</div>
    {kind === "craft" && <button className="quiet leave-action" onClick={() => void send("cancelCraft")}>Leave forge without crafting</button>}
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
  const facts = run.chronicleFacts;
  const title = result === "return" ? "They came home" : result === "succession" ? "A new light is named" : "The road kept their names";
  return <Page
    eyebrow={titleCase(result)}
    title={title}
    intro={result === "return" ? "Recovered holdings are banked once. Temporary growth faded; Leadership now waits at the Wardyard." : "Unsealed expedition holdings and the committed party are lost. Protected chest contents and permanent world facts remain."}
    aside={<button className="primary" onClick={() => void send("continueToHaven")}>{snapshot.view === "returnResults" ? "Review Haven" : "Continue to Haven"}</button>}
  >
    <section className="terminal-ledger stage-panel">
      <PillarRail lit={snapshot.haven.litPillars} />
      <h2>{snapshot.haven.name}</h2>
      <p>{snapshot.haven.litPillars}/10 pillars lit · Haven Gloom {snapshot.haven.gloom} · Torches (wick) {snapshot.haven.resources.wick}</p>
      {facts !== undefined && <>
        <h3>Ownership ledger</h3>
        <p><strong>Sealed at waypoint:</strong> {facts.sealedItemNames.join(", ") || "None"}</p>
        <p><strong>{result === "return" ? "Recovered and banked" : "Would have been recovered"}:</strong> {facts.recoveredItemNames.join(", ") || "None"}</p>
        <p><strong>Lost on the road:</strong> {facts.lostItemNames.join(", ") || "None"}</p>
        <p><strong>Survivors:</strong> {facts.heroNames.join(", ")}</p>
        <h3>Chronicle</h3>
        <p>Road: {facts.visitedNodes.map(titleCase).join(" → ")}</p>
        <p>Events: {facts.eventChoices.map(humanizeEventChoice).join("; ") || "None"}</p>
        <p>Injuries: {facts.injuries.join(", ") || "None"}</p>
        <p>Waypoints claimed: {facts.claimedWaypointIds.map(titleCase).join(", ") || "None"}</p>
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
  const {
    snapshot, loading, busy, error, facts, boot, profiles, session, mismatch, mismatchProfile,
    load, submit, clearError, createProfile, selectProfile, renameProfile, deleteProfile, logout,
    startNewCampaign, showTitle, continuePlay
  } = useNightfall();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(readSidebarPreference);
  const [sidebarOverride, setSidebarOverride] = useState<boolean | null>(null);
  const [partyOpen, setPartyOpen] = useState(false);
  const [newCampaignOpen, setNewCampaignOpen] = useState(false);
  useEffect(() => { void load(); }, [load]);
  useEffect(() => { setSidebarOverride(null); }, [snapshot?.view]);
  const recentFacts = useMemo(() => facts.slice(-5).reverse(), [facts]);
  if (loading || boot === "loading") return <div className="splash"><img className="lantern-mark" src="/art/brand/nightfall-lantern-mark.webp" alt="" />Reading the Pillarhouse ledger…</div>;
  if (boot === "host_down") return <div className="splash error"><h1>The local host is dark</h1><p>{error}</p><button onClick={() => void load()}>Try again</button></div>;
  if (newCampaignOpen && session.profile !== undefined) {
    return <NewCampaignConfirm
      profile={session.profile}
      busy={busy}
      error={error}
      onConfirm={() => { void startNewCampaign(true).then((ok) => { if (ok) setNewCampaignOpen(false); }); }}
      onCancel={() => setNewCampaignOpen(false)}
    />;
  }
  if (boot === "mismatch" && mismatch !== undefined && mismatchProfile !== undefined) {
    return <MismatchScreen
      mismatch={mismatch}
      profile={mismatchProfile}
      busy={busy}
      error={error}
      onKeep={() => { void showTitle(); }}
      onReplace={() => { void startNewCampaign(true); }}
      onSwitch={() => { void logout(); }}
    />;
  }
  if (boot === "title") {
    return <TitleScreen
      profiles={profiles}
      sessionProfile={session.profile}
      busy={busy}
      error={error}
      onContinue={() => { void continuePlay(); }}
      onNewCampaign={() => {
        if (session.profile?.campaignStatus === "ok") setNewCampaignOpen(true);
        else void startNewCampaign(false);
      }}
      onCreate={createProfile}
      onSelect={selectProfile}
      onRename={renameProfile}
      onDelete={deleteProfile}
      onLogout={() => { void logout(); }}
      onDismissError={clearError}
    />;
  }
  if (snapshot === undefined) return <div className="splash error"><h1>The local host is dark</h1><p>{error}</p><button onClick={() => void load()}>Try again</button></div>;
  if (snapshot.view === "founding") {
    return <FoundingScreen busy={busy} error={error} onFound={(name) => { void submit("nameHaven", { name }); }} onSwitch={() => { void showTitle(); }} />;
  }
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
          <img className="lantern-mark" src="/art/brand/nightfall-lantern-mark.webp" alt="" aria-hidden="true" />
          <div className="brand-copy"><small>Vesper field ledger</small><strong>Nightfall</strong></div>
        </div>
        <button type="button" className="rail-toggle quiet" onClick={toggleSidebar} aria-expanded={!railCollapsed} aria-controls="way-lantern-body" title={railCollapsed ? "Expand sidebar" : "Collapse sidebar"}>
          {railCollapsed ? "»" : "«"}
        </button>
      </div>
      <div id="way-lantern-body" className="lantern-body" hidden={railCollapsed}>
        <PillarRail lit={snapshot.haven.litPillars} />
        <div className="save-state"><span className={busy ? "pulse" : ""} />{busy ? "Resolving…" : `Saved · revision ${snapshot.revision}`}</div>
        <button type="button" className="quiet survivors-launch" onClick={() => { void showTitle(); }}>Survivors</button>
        <button type="button" className={`party-launch${partyOpen ? " is-active" : ""}`} onClick={() => setPartyOpen(true)} aria-expanded={partyOpen}>
          Party & packs
        </button>
        {recentFacts.length > 0 && <section className="fact-log" aria-live="polite"><h2>What changed</h2>{recentFacts.map((fact) => {
          const presented = presentLootFact(snapshot, fact);
          return <p key={fact.id} className={presented.className}>
            {presented.glyph !== undefined && presented.rarityLabel !== undefined && (
              <span className="fact-log-rarity" aria-hidden="true">{presented.glyph} {presented.rarityLabel}</span>
            )}
            <span className="fact-log-message">{presented.message}</span>
          </p>;
        })}</section>}
      </div>
      {railCollapsed && <div className="lantern-rail">
        <div className="rail-pillars" title={`${snapshot.haven.litPillars} of 10 pillars lit`} aria-label={`${snapshot.haven.litPillars} of 10 Haven pillars lit`}>
          <strong>{snapshot.haven.litPillars}</strong><span>/10</span>
        </div>
        <div className="save-state rail-save" title={busy ? "Resolving…" : `Saved · revision ${snapshot.revision}`}>
          <span className={busy ? "pulse" : ""} />
        </div>
        <button type="button" className="rail-party" onClick={() => { void showTitle(); }} title="Survivors" aria-label="Open local survivors">S</button>
        <button type="button" className={`rail-party${partyOpen ? " is-active" : ""}`} onClick={() => setPartyOpen(true)} title="Party & packs" aria-label="Open party and packs" aria-expanded={partyOpen}>P</button>
      </div>}
    </aside>
    <div className="content"><CurrentView snapshot={snapshot} send={submit} /></div>
    <PartyInventory snapshot={snapshot} open={partyOpen} onClose={() => setPartyOpen(false)} send={submit} />
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
