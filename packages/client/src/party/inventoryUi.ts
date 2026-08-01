import type { DragEvent } from "react";
import type { EquipmentSlot, HeroSnapshot, ItemEquipmentSlot, ItemInstance } from "@nightfall/contracts";
import { titleCase } from "../decisionUi.js";

export const EQUIP_SLOTS: readonly EquipmentSlot[] = [
  "head",
  "mainHand",
  "body",
  "offHand",
  "gloves",
  "legs",
  "feet",
  "relic1",
  "relic2"
];

export const SLOT_LABELS: Record<EquipmentSlot, string> = {
  mainHand: "Main Hand",
  offHand: "Off Hand",
  head: "Head",
  body: "Body",
  gloves: "Gloves",
  legs: "Legs",
  feet: "Feet",
  relic1: "Relic I",
  relic2: "Relic II"
};

/** Compact labels for the paper-doll grid cells. */
export const SLOT_SHORT_LABELS: Record<EquipmentSlot, string> = {
  mainHand: "Main",
  offHand: "Off",
  head: "Head",
  body: "Body",
  gloves: "Gloves",
  legs: "Legs",
  feet: "Feet",
  relic1: "Relic I",
  relic2: "Relic II"
};

export const SLOT_GRID_AREA: Record<EquipmentSlot, string> = {
  head: "head",
  mainHand: "main",
  body: "body",
  offHand: "off",
  gloves: "gloves",
  legs: "legs",
  feet: "feet",
  relic1: "relic1",
  relic2: "relic2"
};

export function itemById(holdings: readonly ItemInstance[], instanceId: string | null): ItemInstance | undefined {
  if (instanceId === null) return undefined;
  return holdings.find((item) => item.instanceId === instanceId);
}

export function rarityClass(rarityId: ItemInstance["rarityId"]): string {
  return `is-rarity-${rarityId}`;
}

export function itemKindLabel(item: ItemInstance): string {
  if (item.itemKind === "equipment") return titleCase(item.rarityId);
  return titleCase(item.itemKind);
}

export function itemShortName(name: string): string {
  const words = name.split(/\s+/);
  if (words.length <= 2) return name;
  return `${words[0]!} ${words[1]!}`;
}

export function resolveEquipSlot(hero: HeroSnapshot, equipmentSlot: ItemEquipmentSlot): EquipmentSlot | undefined {
  if (equipmentSlot === "relic") {
    if (hero.equipment.relic1 === null) return "relic1";
    if (hero.equipment.relic2 === null) return "relic2";
    return undefined;
  }
  if (hero.equipment[equipmentSlot] !== null) return undefined;
  return equipmentSlot;
}

export function slotAcceptsItem(slot: EquipmentSlot, equipmentSlot: ItemEquipmentSlot | undefined): boolean {
  if (equipmentSlot === undefined) return false;
  if (equipmentSlot === "relic") return slot === "relic1" || slot === "relic2";
  return slot === equipmentSlot;
}

export function equipEligibility(hero: HeroSnapshot, item: ItemInstance): { ok: boolean; reason?: string; targetSlot?: EquipmentSlot } {
  if (item.itemKind !== "equipment") return { ok: false, reason: "Not equipment" };
  const equipmentSlot = item.mechanicSnapshot.equipmentSlot;
  if (equipmentSlot === undefined) return { ok: false, reason: "Slot unknown" };
  const schools = item.mechanicSnapshot.requiredSchools ?? [];
  if (schools.length > 0 && !schools.some((school) => hero.schools.includes(school))) {
    return { ok: false, reason: `Requires ${schools.map(titleCase).join(" or ")} school` };
  }
  const targetSlot = resolveEquipSlot(hero, equipmentSlot);
  if (targetSlot === undefined) {
    if (equipmentSlot === "relic") return { ok: false, reason: "Both relic slots full" };
    return { ok: false, reason: `${SLOT_LABELS[equipmentSlot as EquipmentSlot] ?? titleCase(equipmentSlot)} already filled` };
  }
  return { ok: true, targetSlot };
}

export function itemFitsSlot(hero: HeroSnapshot, item: ItemInstance, slot: EquipmentSlot): boolean {
  if (item.itemKind !== "equipment") return false;
  const equipmentSlot = item.mechanicSnapshot.equipmentSlot;
  if (!slotAcceptsItem(slot, equipmentSlot)) return false;
  const schools = item.mechanicSnapshot.requiredSchools ?? [];
  if (schools.length > 0 && !schools.some((school) => hero.schools.includes(school))) return false;
  return true;
}

export function blockedEquipSlot(hero: HeroSnapshot, item: ItemInstance): EquipmentSlot | undefined {
  if (item.itemKind !== "equipment") return undefined;
  const equipmentSlot = item.mechanicSnapshot.equipmentSlot;
  if (equipmentSlot === undefined) return undefined;
  const schools = item.mechanicSnapshot.requiredSchools ?? [];
  if (schools.length > 0 && !schools.some((school) => hero.schools.includes(school))) return undefined;
  if (resolveEquipSlot(hero, equipmentSlot) !== undefined) return undefined;

  if (equipmentSlot === "relic") {
    if (hero.equipment.relic1 !== null) return "relic1";
    if (hero.equipment.relic2 !== null) return "relic2";
    return undefined;
  }
  const slot = equipmentSlot as EquipmentSlot;
  return hero.equipment[slot] !== null ? slot : undefined;
}

export function itemTargetSlots(hero: HeroSnapshot, item: ItemInstance): EquipmentSlot[] {
  if (item.itemKind !== "equipment") return [];
  const equipmentSlot = item.mechanicSnapshot.equipmentSlot;
  if (equipmentSlot === undefined) return [];
  const schools = item.mechanicSnapshot.requiredSchools ?? [];
  if (schools.length > 0 && !schools.some((school) => hero.schools.includes(school))) return [];

  if (equipmentSlot === "relic") {
    return (["relic1", "relic2"] as const).filter((slot) => hero.equipment[slot] === null);
  }
  const slot = equipmentSlot as EquipmentSlot;
  return hero.equipment[slot] === null && itemFitsSlot(hero, item, slot) ? [slot] : [];
}

export function itemBlockedSlots(hero: HeroSnapshot, item: ItemInstance): EquipmentSlot[] {
  if (item.itemKind !== "equipment") return [];
  const equipmentSlot = item.mechanicSnapshot.equipmentSlot;
  if (equipmentSlot === undefined) return [];
  const schools = item.mechanicSnapshot.requiredSchools ?? [];
  if (schools.length > 0 && !schools.some((school) => hero.schools.includes(school))) return [];

  if (equipmentSlot === "relic") {
    return (["relic1", "relic2"] as const).filter((slot) => hero.equipment[slot] !== null);
  }
  const slot = equipmentSlot as EquipmentSlot;
  return hero.equipment[slot] !== null && itemFitsSlot(hero, item, slot) ? [slot] : [];
}

export function packItemsForSlot(hero: HeroSnapshot, pack: readonly ItemInstance[], slot: EquipmentSlot): ItemInstance[] {
  if (hero.equipment[slot] !== null) return [];
  return pack.filter((item) => itemFitsSlot(hero, item, slot));
}

export function itemUseSummary(hero: HeroSnapshot, item: ItemInstance): { label: string; ok: boolean } {
  if (item.itemKind === "equipment") {
    const eligibility = equipEligibility(hero, item);
    if (eligibility.ok && eligibility.targetSlot !== undefined) {
      return { label: SLOT_SHORT_LABELS[eligibility.targetSlot], ok: true };
    }
    const reason = eligibility.reason ?? "Cannot equip";
    if (reason.includes("school")) return { label: "Wrong school", ok: false };
    if (reason.includes("already filled")) return { label: reason.replace(" already filled", " full"), ok: false };
    if (reason.includes("Both relic")) return { label: "Relics full", ok: false };
    return { label: reason, ok: false };
  }
  if (item.itemKind === "scroll") {
    const eligibility = learnEligibility(hero, item);
    const cardId = item.mechanicSnapshot.grantedCardId;
    const cardName = cardId !== undefined ? titleCase(cardId.replaceAll("_", " ")) : "pattern";
    if (eligibility.ok) return { label: `Learn ${cardName}`, ok: true };
    return { label: eligibility.reason ?? "Cannot learn", ok: false };
  }
  return { label: "Cannot use", ok: false };
}

export function learnEligibility(hero: HeroSnapshot, item: ItemInstance): { ok: boolean; reason?: string } {
  if (item.itemKind !== "scroll") return { ok: false, reason: "Not a scroll" };
  const schools = item.mechanicSnapshot.requiredSchools ?? [];
  if (schools.length > 0 && !schools.some((school) => hero.schools.includes(school))) {
    return { ok: false, reason: `Requires ${schools.map(titleCase).join(" or ")} school` };
  }
  return { ok: true };
}

export type DragPayload =
  | { kind: "stash"; itemId: string }
  | { kind: "slot"; slot: EquipmentSlot; itemId: string };

export const DRAG_MIME = "application/x-nightfall-item";

export function writeDragPayload(event: DragEvent, payload: DragPayload): void {
  event.dataTransfer.setData(DRAG_MIME, JSON.stringify(payload));
  event.dataTransfer.effectAllowed = "move";
}

export function readDragPayload(event: DragEvent): DragPayload | undefined {
  const raw = event.dataTransfer.getData(DRAG_MIME);
  if (raw === "") return undefined;
  try {
    return JSON.parse(raw) as DragPayload;
  } catch {
    return undefined;
  }
}
