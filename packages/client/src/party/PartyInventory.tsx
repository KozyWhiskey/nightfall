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
  SLOT_SHORT_LABELS,
  blockedEquipSlot,
  equipEligibility,
  itemBlockedSlots,
  itemById,
  itemFitsSlot,
  itemKindLabel,
  itemShortName,
  itemTargetSlots,
  itemUseSummary,
  learnEligibility,
  packItemsForSlot,
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

function HeroSummary({ hero }: { hero: HeroSnapshot }) {
  return <div className="inventory-hero-summary">
    <div className="inventory-hero-summary-head">
      <strong>{hero.name}</strong>
      <span>{titleCase(hero.classId)}</span>
    </div>
    <div className="inventory-stat-row">
      <span>HP</span><strong>{hero.hp}/{hero.maxHp}</strong>
      <span>Mana</span><strong>{hero.mana}/{hero.maxMana}</strong>
      <span>Stamina</span><strong>{hero.stamina}/{hero.maxStamina}</strong>
    </div>
    <p className="inventory-hero-attrs">VIT {hero.attributes.vit} · DEX {hero.attributes.dex} · STR {hero.attributes.str} · INT {hero.attributes.int}</p>
    {hero.temporaryAttribute !== undefined && <p className="party-chip">Temp +1 {hero.temporaryAttribute.toUpperCase()}</p>}
    {hero.injuries.length > 0 && <p className="warning">Injuries: {hero.injuries.map(titleCase).join(", ")}</p>}
  </div>;
}

function InventoryCell({
  item,
  selected,
  hint,
  hintOk,
  slotMatch,
  slotMuted,
  draggable,
  onSelect,
  onDragStart
}: {
  item: ItemInstance;
  selected: boolean;
  hint: string;
  hintOk: boolean;
  slotMatch: boolean;
  slotMuted: boolean;
  draggable: boolean;
  onSelect: () => void;
  onDragStart: (event: DragEvent) => void;
}) {
  return <button
    type="button"
    className={`inventory-cell ${rarityClass(item.rarityId)}${selected ? " is-selected" : ""}${slotMatch ? " is-slot-match" : ""}${slotMuted ? " is-slot-muted" : ""}${draggable ? " is-draggable" : ""}${hintOk ? " is-ready" : ""}`}
    title={`${item.displaySnapshot.name} — ${hint}`}
    aria-label={`${item.displaySnapshot.name}, ${itemKindLabel(item)}, ${hint}`}
    aria-pressed={selected}
    draggable={draggable || undefined}
    onDragStart={draggable ? onDragStart : undefined}
    onClick={onSelect}
  >
    <ItemGlyph item={item} />
    <strong>{itemShortName(item.displaySnapshot.name)}</strong>
    <small className={hintOk ? "is-destination" : ""}>{hintOk ? `→ ${hint}` : hint}</small>
  </button>;
}

function EquipSlotCell({
  slot,
  item,
  canManage,
  selected,
  itemTarget,
  itemBlocked,
  dropHint,
  onSelect,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop
}: {
  slot: EquipmentSlot;
  item: ItemInstance | undefined;
  canManage: boolean;
  selected: boolean;
  itemTarget: boolean;
  itemBlocked: boolean;
  dropHint?: "valid" | "invalid";
  onSelect: () => void;
  onDragStart: (event: DragEvent) => void;
  onDragOver: (event: DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (event: DragEvent) => void;
}) {
  const filled = item !== undefined;
  const Tag = canManage ? "button" : "div";
  return <Tag
    type={canManage ? "button" : undefined}
    className={`equip-slot ${rarityClass(item?.rarityId ?? "salvaged")}${filled ? " is-filled" : " is-empty"}${selected ? " is-selected" : ""}${itemTarget ? " is-item-target" : ""}${itemBlocked ? " is-item-blocked" : ""}${dropHint === "valid" ? " is-drop-valid" : ""}${dropHint === "invalid" ? " is-drop-invalid" : ""}`}
    style={{ gridArea: SLOT_GRID_AREA[slot] }}
    title={filled ? item.displaySnapshot.name : SLOT_LABELS[slot]}
    aria-label={filled ? `${SLOT_LABELS[slot]}: ${item.displaySnapshot.name}, click to inspect` : `${SLOT_LABELS[slot]}, empty, click to see compatible gear`}
    aria-pressed={selected || undefined}
    draggable={filled && canManage}
    onDragStart={filled && canManage ? onDragStart : undefined}
    onDragOver={canManage ? onDragOver : undefined}
    onDragLeave={canManage ? onDragLeave : undefined}
    onDrop={canManage ? onDrop : undefined}
    onClick={onSelect}
  >
    <span className="equip-slot-label">{SLOT_SHORT_LABELS[slot]}</span>
    {filled ? <>
      <ItemGlyph item={item} />
      <strong>{itemShortName(item.displaySnapshot.name)}</strong>
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

function LoadoutDetailPane({
  hero,
  pack,
  holdings,
  focusItem,
  focusSlot,
  ownershipLabel,
  onSelectItem
}: {
  hero: HeroSnapshot;
  pack: readonly ItemInstance[];
  holdings: readonly ItemInstance[];
  focusItem: ItemInstance | undefined;
  focusSlot: EquipmentSlot | null;
  ownershipLabel: string;
  onSelectItem: (itemId: string) => void;
}) {
  const equippedInSlot = focusSlot === null ? undefined : itemById(holdings, hero.equipment[focusSlot]);
  const slotCandidates = focusSlot === null ? [] : packItemsForSlot(hero, pack, focusSlot);

  if (focusItem === undefined && focusSlot === null) {
    return <>
      <HeroSummary hero={hero} />
      <p className="empty">Select gear in the bag or a slot on the doll to inspect it.</p>
    </>;
  }

  return <>
    <HeroSummary hero={hero} />
    {focusSlot !== null && <>
      <small>Equipment slot · {ownershipLabel}</small>
      <h3>{SLOT_LABELS[focusSlot]}</h3>
      {equippedInSlot === undefined
        ? <p className="inventory-hint">Empty — matching bag items are highlighted in green.</p>
        : <>
          <ItemGlyph item={equippedInSlot} large />
          <p className="inventory-detail-item-name">{equippedInSlot.displaySnapshot.name}</p>
          <ItemEffects description={equippedInSlot.displaySnapshot.description} />
          {equippedInSlot.curseId !== undefined && <p className="warning">{titleCase(equippedInSlot.curseId)}</p>}
          <p className="inventory-hint">Worn by {hero.name}. Use the action bar below to unequip.</p>
        </>}
      {slotCandidates.length > 0 && <>
        <h4 className="inventory-detail-subhead">Can equip from bag</h4>
        <ul className="inventory-candidate-list">
          {slotCandidates.map((item) => <li key={item.instanceId}>
            <button type="button" className="inventory-candidate" onClick={() => onSelectItem(item.instanceId)}>
              <ItemGlyph item={item} />
              <span>{item.displaySnapshot.name}</span>
            </button>
          </li>)}
        </ul>
      </>}
      {focusSlot !== null && equippedInSlot !== undefined && slotCandidates.length === 0 && (
        <p className="inventory-hint">Unequip the worn item to swap gear in this slot.</p>
      )}
      {focusSlot !== null && equippedInSlot === undefined && slotCandidates.length === 0 && (
        <p className="inventory-hint">Nothing in your bag fits this slot for {hero.name}.</p>
      )}
    </>}

    {focusItem !== undefined && <>
      {focusSlot !== null && equippedInSlot?.instanceId === focusItem.instanceId && <hr className="inventory-detail-divider" />}
      {(focusSlot === null || focusItem.instanceId !== equippedInSlot?.instanceId) && <>
        <ItemGlyph item={focusItem} large />
        <small>{itemKindLabel(focusItem)} · {ownershipLabel}</small>
        <h3>{focusItem.displaySnapshot.name}</h3>
        <ItemEffects description={focusItem.displaySnapshot.description} />
        {focusItem.curseId !== undefined && <p className="warning">{titleCase(focusItem.curseId)}</p>}
        {focusItem.itemKind === "equipment" && (() => {
          const eligibility = equipEligibility(hero, focusItem);
          return eligibility.ok && eligibility.targetSlot !== undefined
            ? <p className="inventory-destination">Goes in <strong>{SLOT_LABELS[eligibility.targetSlot]}</strong></p>
            : <p className="inventory-hint">{eligibility.reason}</p>;
        })()}
        {focusItem.itemKind === "scroll" && (() => {
          const eligibility = learnEligibility(hero, focusItem);
          const cardId = focusItem.mechanicSnapshot.grantedCardId;
          const cardName = cardId !== undefined ? titleCase(cardId.replaceAll("_", " ")) : "unknown pattern";
          return <>
            <p className="inventory-destination">Teaches <strong>{cardName}</strong></p>
            <p className="inventory-hint">Scroll is consumed on learn. Pattern becomes permanent only after a successful Return.</p>
            {!eligibility.ok && <p className="inventory-hint">{eligibility.reason}</p>}
          </>;
        })()}
      </>}
    </>}
  </>;
}

function CharacterSheet({
  hero,
  holdings,
  canManage,
  selectedSlot,
  dragOverSlot,
  onSelectSlot,
  onEquipToSlot,
  onDragPayload,
  onDragOverSlot,
  highlightTargetSlots,
  highlightBlockedSlots,
  onDragLeaveSlot
}: {
  hero: HeroSnapshot;
  holdings: readonly ItemInstance[];
  canManage: boolean;
  selectedSlot: EquipmentSlot | null;
  dragOverSlot: EquipmentSlot | null;
  highlightTargetSlots: ReadonlySet<EquipmentSlot>;
  highlightBlockedSlots: ReadonlySet<EquipmentSlot>;
  onSelectSlot: (slot: EquipmentSlot) => void;
  onEquipToSlot: (itemId: string) => void;
  onDragPayload: (payload: ReturnType<typeof readDragPayload>, slot?: EquipmentSlot) => void;
  onDragOverSlot: (slot: EquipmentSlot | null) => void;
  onDragLeaveSlot: () => void;
}) {
  const crossHighlight = selectedSlot !== null || highlightTargetSlots.size > 0 || highlightBlockedSlots.size > 0;
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
    <header className="inventory-column-head">
      <h3>Equipment</h3>
      <p>Click a slot or bag item to inspect.</p>
    </header>
    <div className="inventory-doll-wrap">
      <div className={`inventory-doll${crossHighlight ? " has-cross-highlight" : ""}`}>
      <div className="inventory-portrait" aria-hidden="true">
        <CombatPortrait src={combatantArtSrc("hero", hero.classId)} variant={silhouetteForHero(hero.classId)} />
      </div>
      {EQUIP_SLOTS.map((slot) => <EquipSlotCell
        key={slot}
        slot={slot}
        item={equipped[slot]}
        canManage={canManage}
        selected={selectedSlot === slot}
        itemTarget={highlightTargetSlots.has(slot)}
        itemBlocked={highlightBlockedSlots.has(slot)}
        dropHint={slotDropHint(slot)}
        onSelect={() => onSelectSlot(slot)}
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
  const focusBagItem = focusItem !== undefined && pack.some((item) => item.instanceId === focusItem.instanceId)
    ? focusItem
    : undefined;

  const highlightTargetSlots = useMemo(() => {
    if (hero === undefined || focusBagItem?.itemKind !== "equipment") return new Set<EquipmentSlot>();
    return new Set(itemTargetSlots(hero, focusBagItem));
  }, [hero, focusBagItem]);

  const highlightBlockedSlots = useMemo(() => {
    if (hero === undefined || focusBagItem?.itemKind !== "equipment") return new Set<EquipmentSlot>();
    return new Set(itemBlockedSlots(hero, focusBagItem));
  }, [hero, focusBagItem]);

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

  const cellState = (item: ItemInstance): { hint: string; hintOk: boolean; draggable: boolean; slotMatch: boolean; slotMuted: boolean } => {
    if (hero === undefined) return { hint: "", hintOk: false, draggable: false, slotMatch: false, slotMuted: false };
    const summary = itemUseSummary(hero, item);
    const eligibility = item.itemKind === "equipment" ? equipEligibility(hero, item) : undefined;
    const fitsFocusedSlot = focusSlot !== null && itemFitsSlot(hero, item, focusSlot);
    const slotFocusActive = focusSlot !== null;
    return {
      hint: summary.label,
      hintOk: summary.ok,
      draggable: canManage && eligibility?.ok === true,
      slotMatch: fitsFocusedSlot,
      slotMuted: slotFocusActive && item.itemKind === "equipment" && !fitsFocusedSlot
    };
  };

  const stashCrossHighlight = focusSlot !== null || focusBagItem?.itemKind === "equipment";

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

  const slotCandidates = focusSlot === null ? [] : packItemsForSlot(hero, pack, focusSlot);

  const loadoutAction = (() => {
    if (!canManage || focusBagItem === undefined) return null;
    if (focusBagItem.itemKind === "equipment") {
      const eligibility = equipEligibility(hero, focusBagItem);
      if (eligibility.ok && eligibility.targetSlot !== undefined) {
        return {
          kind: "equip" as const,
          label: `Equip ${focusBagItem.displaySnapshot.name} → ${SLOT_LABELS[eligibility.targetSlot]}`,
          onClick: () => equipItem(focusBagItem)
        };
      }
      const blocked = blockedEquipSlot(hero, focusBagItem);
      if (blocked !== undefined) {
        return {
          kind: "unequip-first" as const,
          label: `${SLOT_LABELS[blocked]} is full — open slot to unequip`,
          onClick: () => { setFocusSlot(blocked); setFocusItemId(hero.equipment[blocked]); }
        };
      }
    }
    if (focusBagItem.itemKind === "scroll" && learnEligibility(hero, focusBagItem).ok) {
      return {
        kind: "learn" as const,
        label: `Learn ${focusBagItem.displaySnapshot.name} on ${hero.name}`,
        onClick: () => learnScroll(focusBagItem)
      };
    }
    return null;
  })();

  const slotQuickEquip = focusSlot !== null && slotCandidates.length === 1 && canManage
    ? { item: slotCandidates[0]!, label: `Equip ${slotCandidates[0]!.displaySnapshot.name}` }
    : null;

  const slotUnequipAction = (() => {
    if (!canManage || focusSlot === null || focusBagItem !== undefined) return null;
    const itemId = hero.equipment[focusSlot];
    if (itemId === null) return null;
    const item = itemById(holdings, itemId);
    if (item === undefined) return null;
    return {
      kind: "unequip" as const,
      label: `Unequip ${item.displaySnapshot.name} to bag`,
      onClick: () => unequipSlot(focusSlot)
    };
  })();

  const dockAction: {
    kind: "equip" | "unequip" | "unequip-first" | "learn";
    label: string;
    onClick: () => void;
  } | null = loadoutAction ?? (slotQuickEquip !== null ? {
    kind: "equip",
    label: slotQuickEquip.label,
    onClick: () => equipItem(slotQuickEquip.item)
  } : slotUnequipAction);

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
        <div className="party-panel-tabs" role="tablist" aria-label="Panel mode">
          <button type="button" role="tab" aria-selected={panelMode === "loadout"} className={panelMode === "loadout" ? "is-active" : ""} onClick={() => setPanelMode("loadout")}>Loadout</button>
          <button type="button" role="tab" aria-selected={panelMode === "deck"} className={panelMode === "deck" ? "is-active" : ""} onClick={() => setPanelMode("deck")}>Deck</button>
        </div>
      </div>

      <div className={`party-screen-body${panelMode === "deck" ? " is-deck-mode" : ""}`}>
        {panelMode === "loadout" ? <>
          <CharacterSheet
            hero={hero}
            holdings={holdings}
            canManage={canManage}
            selectedSlot={focusSlot}
            dragOverSlot={dragOverSlot}
            onSelectSlot={(slot) => {
              setFocusSlot(slot);
              setFocusItemId(hero.equipment[slot]);
            }}
            onEquipToSlot={(itemId) => { void send("equipItem", { heroId: hero.id, itemId }); }}
            onDragPayload={handleDragPayload}
            onDragOverSlot={setDragOverSlot}
            onDragLeaveSlot={() => setDragOverSlot(null)}
            highlightTargetSlots={highlightTargetSlots}
            highlightBlockedSlots={highlightBlockedSlots}
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
              <p>Select an item — use the action bar below to equip or learn.</p>
            </header>
            {pack.length === 0
              ? <p className="empty">{run === undefined ? "No spare Haven holdings." : "No unsealed expedition holdings."}</p>
              : <div className={`inventory-grid${stashCrossHighlight ? " has-cross-highlight" : ""}`}>
                {pack.map((item) => {
                  const state = cellState(item);
                  return <InventoryCell
                    key={item.instanceId}
                    item={item}
                    selected={focusItemId === item.instanceId}
                    hint={state.hint}
                    hintOk={state.hintOk}
                    slotMatch={state.slotMatch}
                    slotMuted={state.slotMuted}
                    draggable={state.draggable}
                    onSelect={() => { setFocusItemId(item.instanceId); setFocusSlot(null); }}
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
                  selected={focusItemId === item.instanceId}
                  hint="Sealed"
                  hintOk={false}
                  slotMatch={false}
                  slotMuted={false}
                  draggable={false}
                  onSelect={() => { setFocusItemId(item.instanceId); setFocusSlot(null); }}
                  onDragStart={() => undefined}
                />)}
              </div>
            </>}
          </section>

          <aside className="inventory-detail" aria-label="Item details">
            <header className="inventory-detail-head">
              <h3>Inspector</h3>
              <p>Stats and item details for the selected hero.</p>
            </header>
            <LoadoutDetailPane
              hero={hero}
              pack={pack}
              holdings={holdings}
              focusItem={focusItem}
              focusSlot={focusSlot}
              ownershipLabel={ownershipLabel}
              onSelectItem={(itemId) => setFocusItemId(itemId)}
            />
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

      {(panelMode === "loadout" && dockAction !== null) || run !== undefined ? (
        <footer className="party-screen-dock">
          {panelMode === "loadout" && dockAction !== null && <button
            type="button"
            className={dockAction.kind === "unequip-first" || dockAction.kind === "unequip" ? "dock-secondary" : "primary"}
            onClick={dockAction.onClick}
          >{dockAction.label}</button>}
          {run !== undefined && (
            <div className="inventory-materials">
              <span className="inventory-footer-label">Materials</span>
              {materialLines(run).filter(({ amount }) => amount > 0).map(({ id, amount }) => (
                <span key={id}><b>{amount}</b> {titleCase(id)}</span>
              ))}
            </div>
          )}
        </footer>
      ) : null}
    </div>
  </>;
}
