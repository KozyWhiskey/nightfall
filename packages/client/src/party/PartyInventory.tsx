import { useEffect, useMemo, useState, type DragEvent } from "react";
import type { CommandType, EquipmentSlot, GameSnapshot, HeroSnapshot, ItemInstance } from "@nightfall/contracts";
import { CombatPortrait } from "../art/ArtImage.js";
import { combatantArtSrc, silhouetteForHero } from "../art/artMap.js";
import { materialLines, titleCase } from "../decisionUi.js";
import { DeckCardDetail, DeckPreviewPanel } from "./DeckPreviewPanel.js";
import { ItemGlyph } from "./ItemGlyph.js";
import {
  EQUIP_SLOTS,
  SLOT_GRID_AREA,
  SLOT_LABELS,
  equipEligibility,
  itemById,
  itemKindLabel,
  itemShortName,
  learnEligibility,
  rarityClass,
  readDragPayload,
  slotAcceptsItem,
  writeDragPayload
} from "./inventoryUi.js";

type PanelMode = "loadout" | "deck";

function effectLines(description: string): string[] {
  return description.split(/\n+/).map((line) => line.trim()).filter((line) => line.length > 0);
}

function ItemEffects({ description }: { description: string }) {
  const lines = effectLines(description);
  if (lines.length === 0) return null;
  if (lines.length === 1) return <p className="inventory-detail-effect">{lines[0]}</p>;
  return <ul className="inventory-detail-effects" aria-label="Item effects">{lines.map((line) => <li key={line}>{line}</li>)}</ul>;
}

function InventoryCell({
  item,
  hero,
  selected,
  disabled,
  hint,
  draggable,
  onSelect,
  onActivate,
  onDragStart
}: {
  item: ItemInstance;
  hero: HeroSnapshot;
  selected: boolean;
  disabled: boolean;
  hint?: string;
  draggable: boolean;
  onSelect: () => void;
  onActivate: () => void;
  onDragStart: (event: DragEvent) => void;
}) {
  const Tag = disabled ? "div" : "button";
  return <Tag
    type={disabled ? undefined : "button"}
    className={`inventory-cell ${rarityClass(item.rarityId)}${selected ? " is-selected" : ""}${disabled ? " is-disabled" : ""}${draggable ? " is-draggable" : ""}`}
    title={hint ?? item.displaySnapshot.name}
    aria-label={`${item.displaySnapshot.name}, ${itemKindLabel(item)}${hint !== undefined ? `, ${hint}` : ""}`}
    aria-disabled={disabled || undefined}
    draggable={draggable || undefined}
    onDragStart={draggable ? onDragStart : undefined}
    onClick={disabled ? undefined : () => { onSelect(); onActivate(); }}
  >
    <ItemGlyph item={item} />
    <strong>{itemShortName(item.displaySnapshot.name)}</strong>
    <small>{disabled && hint !== undefined ? hint : itemKindLabel(item)}</small>
  </Tag>;
}

function EquipSlotCell({
  slot,
  item,
  canManage,
  selected,
  dropHint,
  onSelect,
  onUnequip,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop
}: {
  slot: EquipmentSlot;
  item: ItemInstance | undefined;
  canManage: boolean;
  selected: boolean;
  dropHint?: "valid" | "invalid";
  onSelect: () => void;
  onUnequip: (slot: EquipmentSlot) => void;
  onDragStart: (event: DragEvent) => void;
  onDragOver: (event: DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (event: DragEvent) => void;
}) {
  const filled = item !== undefined;
  const Tag = canManage ? "button" : "div";
  return <Tag
    type={canManage ? "button" : undefined}
    className={`equip-slot ${rarityClass(item?.rarityId ?? "salvaged")}${filled ? " is-filled" : " is-empty"}${selected ? " is-selected" : ""}${dropHint === "valid" ? " is-drop-valid" : ""}${dropHint === "invalid" ? " is-drop-invalid" : ""}`}
    style={{ gridArea: SLOT_GRID_AREA[slot] }}
    title={filled ? item.displaySnapshot.name : SLOT_LABELS[slot]}
    aria-label={filled ? `${SLOT_LABELS[slot]}: ${item.displaySnapshot.name}${canManage ? ", drag or click to unequip" : ""}` : `${SLOT_LABELS[slot]}, empty${canManage ? ", drop gear here" : ""}`}
    draggable={filled && canManage}
    onDragStart={filled && canManage ? onDragStart : undefined}
    onDragOver={canManage ? onDragOver : undefined}
    onDragLeave={canManage ? onDragLeave : undefined}
    onDrop={canManage ? onDrop : undefined}
    onClick={filled && canManage ? () => { onSelect(); onUnequip(slot); } : onSelect}
  >
    <span className="equip-slot-label">{SLOT_LABELS[slot]}</span>
    {filled ? <>
      <ItemGlyph item={item} />
      <strong>{itemShortName(item.displaySnapshot.name)}</strong>
      <small>{titleCase(item.rarityId)}</small>
    </> : <span className="equip-slot-empty" aria-hidden="true">—</span>}
  </Tag>;
}

function HeroTab({
  hero,
  active,
  onSelect
}: {
  hero: HeroSnapshot;
  active: boolean;
  onSelect: () => void;
}) {
  return <button
    type="button"
    className={`party-hero-tab${active ? " is-active" : ""}`}
    aria-pressed={active}
    onClick={onSelect}
  >
    <span>{titleCase(hero.classId)}</span>
    <strong>{hero.name}</strong>
    <small>HP {hero.hp}/{hero.maxHp}</small>
  </button>;
}

function CharacterSheet({
  hero,
  holdings,
  canManage,
  selectedSlot,
  dragOverSlot,
  onSelectSlot,
  onUnequip,
  onEquipToSlot,
  onDragPayload,
  onDragOverSlot,
  onDragLeaveSlot
}: {
  hero: HeroSnapshot;
  holdings: readonly ItemInstance[];
  canManage: boolean;
  selectedSlot: EquipmentSlot | null;
  dragOverSlot: EquipmentSlot | null;
  onSelectSlot: (slot: EquipmentSlot) => void;
  onUnequip: (slot: EquipmentSlot) => void;
  onEquipToSlot: (itemId: string) => void;
  onDragPayload: (payload: ReturnType<typeof readDragPayload>, slot?: EquipmentSlot) => void;
  onDragOverSlot: (slot: EquipmentSlot | null) => void;
  onDragLeaveSlot: () => void;
}) {
  const equipped = useMemo(() => Object.fromEntries(
    EQUIP_SLOTS.map((slot) => [slot, itemById(holdings, hero.equipment[slot])])
  ) as Record<EquipmentSlot, ItemInstance | undefined>, [holdings, hero.equipment]);

  const slotDropHint = (slot: EquipmentSlot): "valid" | "invalid" | undefined => {
    if (dragOverSlot !== slot) return undefined;
    return "valid";
  };

  const slotAcceptsPayload = (slot: EquipmentSlot, payload: NonNullable<ReturnType<typeof readDragPayload>>): boolean => {
    if (payload.kind === "stash") {
      const item = holdings.find((entry) => entry.instanceId === payload.itemId);
      if (item === undefined) return false;
      const eligibility = equipEligibility(hero, item);
      return eligibility.ok && eligibility.targetSlot === slot;
    }
    if (payload.kind === "slot" && payload.slot !== slot) {
      const item = equipped[payload.slot];
      return item !== undefined && slotAcceptsItem(slot, item.mechanicSnapshot.equipmentSlot) && hero.equipment[slot] === null;
    }
    return false;
  };

  const handleDragOver = (event: DragEvent, slot: EquipmentSlot) => {
    event.preventDefault();
    const payload = readDragPayload(event);
    if (payload === undefined) {
      onDragOverSlot(null);
      return;
    }
    const valid = slotAcceptsPayload(slot, payload);
    event.dataTransfer.dropEffect = valid ? "move" : "none";
    onDragOverSlot(valid ? slot : null);
  };

  const handleDrop = (event: DragEvent, slot: EquipmentSlot) => {
    event.preventDefault();
    onDragOverSlot(null);
    const payload = readDragPayload(event);
    if (payload === undefined) return;
    if (payload.kind === "stash" && slotAcceptsPayload(slot, payload)) {
      onEquipToSlot(payload.itemId);
      return;
    }
    if (payload.kind === "slot" && payload.slot !== slot && slotAcceptsPayload(slot, payload)) {
      onDragPayload(payload, slot);
    }
  };

  return <section className="inventory-character" aria-label={`${hero.name} equipment`}>
    <div className="inventory-doll">
      <div className="inventory-portrait" aria-hidden="true">
        <CombatPortrait src={combatantArtSrc("hero", hero.classId)} variant={silhouetteForHero(hero.classId)} />
      </div>
      {EQUIP_SLOTS.map((slot) => <EquipSlotCell
        key={slot}
        slot={slot}
        item={equipped[slot]}
        canManage={canManage}
        selected={selectedSlot === slot}
        dropHint={slotDropHint(slot)}
        onSelect={() => onSelectSlot(slot)}
        onUnequip={onUnequip}
        onDragStart={(event) => {
          const itemId = hero.equipment[slot];
          if (itemId === null) return;
          writeDragPayload(event, { kind: "slot", slot, itemId });
        }}
        onDragOver={(event) => handleDragOver(event, slot)}
        onDragLeave={onDragLeaveSlot}
        onDrop={(event) => handleDrop(event, slot)}
      />)}
    </div>
    <div className="inventory-stats">
      <div className="inventory-stat-row">
        <span>HP</span><strong>{hero.hp}/{hero.maxHp}</strong>
        <span>Mana</span><strong>{hero.mana}/{hero.maxMana}</strong>
        <span>Stamina</span><strong>{hero.stamina}/{hero.maxStamina}</strong>
      </div>
      <p className="stat-line">VIT {hero.attributes.vit} · DEX {hero.attributes.dex} · STR {hero.attributes.str} · INT {hero.attributes.int}</p>
      {hero.temporaryAttribute !== undefined && <p className="party-chip">Temp +1 {hero.temporaryAttribute.toUpperCase()}</p>}
      {hero.injuries.length > 0 && <p className="warning">Injuries: {hero.injuries.map(titleCase).join(", ")}</p>}
      {[...hero.learnedCardIds, ...hero.runLearnedCardIds].length > 0 && <>
        <h4>Learned patterns</h4>
        <p className="inventory-learned">{[...hero.learnedCardIds, ...hero.runLearnedCardIds].map(titleCase).join(" · ")}</p>
      </>}
    </div>
  </section>;
}

export function PartyInventory({
  snapshot,
  open,
  onClose,
  send
}: {
  snapshot: GameSnapshot;
  open: boolean;
  onClose: () => void;
  send: (type: CommandType, payload: Record<string, unknown>, actorId?: string) => Promise<void>;
}) {
  const run = snapshot.activeRun;
  const heroes = run?.heroes ?? snapshot.haven.heroes;
  const holdings = run?.holdings ?? snapshot.haven.holdings;
  const pack = run === undefined
    ? holdings.filter((item) => item.location.kind === "haven")
    : holdings.filter((item) => item.location.kind === "held_by_expedition");
  const sealed = run?.waypointChest ?? [];
  const canManage = snapshot.view === "haven" || snapshot.view === "postReturn"
    || (run?.phase !== undefined && ["map", "reward", "rest", "craft", "waypoint", "event", "temporary_growth"].includes(run.phase));

  const [heroId, setHeroId] = useState(heroes[0]?.id ?? "");
  const [panelMode, setPanelMode] = useState<PanelMode>("loadout");
  const [focusItemId, setFocusItemId] = useState<string | null>(null);
  const [focusSlot, setFocusSlot] = useState<EquipmentSlot | null>(null);
  const [focusCardId, setFocusCardId] = useState<string | null>(null);
  const [dragOverSlot, setDragOverSlot] = useState<EquipmentSlot | null>(null);
  const [stashDropActive, setStashDropActive] = useState(false);

  const hero = heroes.find((entry) => entry.id === heroId) ?? heroes[0];
  const focusItem = focusItemId === null ? undefined : holdings.find((item) => item.instanceId === focusItemId)
    ?? pack.find((item) => item.instanceId === focusItemId);
  const focusCard = hero?.deckPreview?.find((card) => card.cardId === focusCardId);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    globalThis.addEventListener("keydown", onKey);
    return () => globalThis.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (heroes.some((entry) => entry.id === heroId)) return;
    setHeroId(heroes[0]?.id ?? "");
  }, [heroes, heroId]);

  useEffect(() => {
    if (!open) {
      setFocusItemId(null);
      setFocusSlot(null);
      setFocusCardId(null);
      setDragOverSlot(null);
      setStashDropActive(false);
    }
  }, [open]);

  if (!open || hero === undefined) return null;

  const ownershipLabel = run === undefined ? "Haven-held" : "Carried — at risk";
  const equipItem = (item: ItemInstance) => {
    if (!canManage || item.itemKind !== "equipment") return;
    void send("equipItem", { heroId: hero.id, itemId: item.instanceId });
  };
  const learnScroll = (item: ItemInstance) => {
    if (!canManage || item.itemKind !== "scroll") return;
    if (globalThis.confirm(`Learn ${item.displaySnapshot.name}? The physical scroll is consumed. The card becomes permanent only after a successful Return.`)) {
      void send("learnScroll", { heroId: hero.id, itemId: item.instanceId });
    }
  };
  const unequipSlot = (slot: EquipmentSlot) => {
    if (!canManage || hero.equipment[slot] === null) return;
    void send("unequipItem", { heroId: hero.id, slotId: slot });
  };

  const handleDragPayload = (payload: ReturnType<typeof readDragPayload>, _slot?: EquipmentSlot) => {
    if (payload === undefined || !canManage) return;
    if (payload.kind === "slot") unequipSlot(payload.slot);
  };

  const stashDragOver = (event: DragEvent) => {
    const payload = readDragPayload(event);
    if (payload?.kind === "slot") {
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
      setStashDropActive(true);
    }
  };

  const stashDrop = (event: DragEvent) => {
    event.preventDefault();
    setStashDropActive(false);
    handleDragPayload(readDragPayload(event));
  };

  const cellState = (item: ItemInstance): { actionable: boolean; hint: string; draggable: boolean } => {
    if (!canManage) return { actionable: false, hint: "View only", draggable: false };
    if (item.itemKind === "equipment") {
      const eligibility = equipEligibility(hero, item);
      if (eligibility.ok) {
        const slotLabel = eligibility.targetSlot !== undefined ? SLOT_LABELS[eligibility.targetSlot] : "slot";
        return { actionable: true, hint: `Equip to ${slotLabel}`, draggable: true };
      }
      return { actionable: false, hint: eligibility.reason ?? "Cannot equip", draggable: false };
    }
    if (item.itemKind === "scroll") {
      const eligibility = learnEligibility(hero, item);
      return eligibility.ok
        ? { actionable: true, hint: "Click to learn", draggable: false }
        : { actionable: false, hint: eligibility.reason ?? "Cannot learn", draggable: false };
    }
    return { actionable: false, hint: "Cannot use", draggable: false };
  };

  return <>
    <button type="button" className="party-backdrop" aria-label="Close party panel" onClick={onClose} />
    <div className="party-screen" role="dialog" aria-modal="true" aria-label="Party and packs">
      <header className="party-screen-head">
        <div>
          <span>{run === undefined ? "Haven roster" : "Expedition roster"}</span>
          <h2>Party & packs</h2>
        </div>
        {!canManage && <p className="inventory-lock-note">Loadout is view-only here. Change gear at Haven, on the map, or at preparation nodes.</p>}
        <button type="button" className="quiet" onClick={onClose}>Close · Esc</button>
      </header>

      <div className="party-hero-tabs" role="tablist" aria-label="Select hero">
        {heroes.map((entry) => <HeroTab key={entry.id} hero={entry} active={entry.id === hero.id} onSelect={() => {
          setHeroId(entry.id);
          setFocusItemId(null);
          setFocusSlot(null);
          setFocusCardId(null);
        }} />)}
      </div>

      <div className="party-panel-tabs" role="tablist" aria-label="Panel mode">
        <button type="button" role="tab" aria-selected={panelMode === "loadout"} className={panelMode === "loadout" ? "is-active" : ""} onClick={() => setPanelMode("loadout")}>Loadout</button>
        <button type="button" role="tab" aria-selected={panelMode === "deck"} className={panelMode === "deck" ? "is-active" : ""} onClick={() => setPanelMode("deck")}>Deck preview</button>
      </div>

      <div className={`party-screen-body${panelMode === "deck" ? " is-deck-mode" : ""}`}>
        {panelMode === "loadout" ? <>
          <CharacterSheet
            hero={hero}
            holdings={holdings}
            canManage={canManage}
            selectedSlot={focusSlot}
            dragOverSlot={dragOverSlot}
            onSelectSlot={(slot) => { setFocusSlot(slot); setFocusItemId(hero.equipment[slot]); }}
            onUnequip={unequipSlot}
            onEquipToSlot={(itemId) => { void send("equipItem", { heroId: hero.id, itemId }); }}
            onDragPayload={handleDragPayload}
            onDragOverSlot={setDragOverSlot}
            onDragLeaveSlot={() => setDragOverSlot(null)}
          />

          <section
            className={`inventory-stash${stashDropActive ? " is-drop-target" : ""}`}
            aria-label={ownershipLabel}
            onDragOver={stashDragOver}
            onDragLeave={() => setStashDropActive(false)}
            onDrop={stashDrop}
          >
            <header className="inventory-stash-head">
              <h3>{ownershipLabel}</h3>
              <p>Drag gear between stash and slots, or click to equip. Drop worn gear here to unequip.</p>
            </header>
            {pack.length === 0
              ? <p className="empty">{run === undefined ? "No spare Haven holdings." : "No unsealed expedition holdings."}</p>
              : <div className="inventory-grid">
                {pack.map((item) => {
                  const state = cellState(item);
                  return <InventoryCell
                    key={item.instanceId}
                    item={item}
                    hero={hero}
                    selected={focusItemId === item.instanceId}
                    disabled={!state.actionable}
                    hint={state.hint}
                    draggable={state.draggable}
                    onSelect={() => setFocusItemId(item.instanceId)}
                    onActivate={() => item.itemKind === "scroll" ? learnScroll(item) : equipItem(item)}
                    onDragStart={(event) => writeDragPayload(event, { kind: "stash", itemId: item.instanceId })}
                  />;
                })}
              </div>}

            {run !== undefined && sealed.length > 0 && <>
              <header className="inventory-stash-head">
                <h3>Sealed at waypoint</h3>
                <p>Safe from wipe until Return or reclaim.</p>
              </header>
              <div className="inventory-grid is-readonly">
                {sealed.map((item) => <InventoryCell
                  key={item.instanceId}
                  item={item}
                  hero={hero}
                  selected={focusItemId === item.instanceId}
                  disabled
                  hint="Sealed"
                  draggable={false}
                  onSelect={() => setFocusItemId(item.instanceId)}
                  onActivate={() => undefined}
                  onDragStart={() => undefined}
                />)}
              </div>
            </>}
          </section>

          <aside className="inventory-detail" aria-label="Item details">
            {focusItem === undefined ? <p className="empty">Select an item or equipment slot to inspect it.</p> : <>
              <ItemGlyph item={focusItem} large />
              <small>{itemKindLabel(focusItem)} · {ownershipLabel}</small>
              <h3>{focusItem.displaySnapshot.name}</h3>
              <ItemEffects description={focusItem.displaySnapshot.description} />
              {focusItem.curseId !== undefined && <p className="warning">{titleCase(focusItem.curseId)}</p>}
              {canManage && focusItem.itemKind === "equipment" && pack.some((item) => item.instanceId === focusItem.instanceId) && (() => {
                const eligibility = equipEligibility(hero, focusItem);
                return eligibility.ok
                  ? <button type="button" onClick={() => equipItem(focusItem)}>Equip on {hero.name} ({eligibility.targetSlot !== undefined ? SLOT_LABELS[eligibility.targetSlot] : "slot"})</button>
                  : <p className="inventory-hint">{eligibility.reason}</p>;
              })()}
              {canManage && focusItem.itemKind === "scroll" && pack.some((item) => item.instanceId === focusItem.instanceId) && (() => {
                const eligibility = learnEligibility(hero, focusItem);
                return eligibility.ok
                  ? <button type="button" onClick={() => learnScroll(focusItem)}>Learn on {hero.name}</button>
                  : <p className="inventory-hint">{eligibility.reason}</p>;
              })()}
            </>}
          </aside>
        </> : <>
          <section className="inventory-deck-main" aria-label={`${hero.name} deck preview`}>
            <DeckPreviewPanel hero={hero} focusCardId={focusCardId} onSelectCard={setFocusCardId} />
          </section>
          <aside className="inventory-detail" aria-label="Card details">
            <DeckCardDetail card={focusCard} />
          </aside>
        </>}
      </div>

      {run !== undefined && (
        <footer className="inventory-footer">
          <span className="inventory-footer-label">Materials</span>
          <div className="inventory-materials">
            {materialLines(run).filter(({ amount }) => amount > 0).map(({ id, amount }) => (
              <span key={id}><b>{amount}</b> {titleCase(id)}</span>
            ))}
          </div>
        </footer>
      )}
    </div>
  </>;
}
