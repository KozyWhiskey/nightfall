import type { EquipmentSlot, ExpeditionRunSnapshot, HeroSnapshot, ItemEquipmentSlot, ItemInstance, RewardOffer } from "@nightfall/contracts";
import { itemById, SLOT_LABELS } from "./party/inventoryUi.js";
import { titleCase } from "./decisionUi.js";

export function effectLines(description: string): string[] {
  return description.split(/\n+/).map((line) => line.trim()).filter((line) => line.length > 0);
}

export function isDeckInjectLine(line: string): boolean {
  return /^Adds to deck\b/i.test(line) || /^Learn\b/i.test(line);
}

export function deckInjectLines(description: string): string[] {
  return effectLines(description).filter(isDeckInjectLine);
}

export function nonInjectEffectLines(description: string): string[] {
  return effectLines(description).filter((line) => !isDeckInjectLine(line));
}

export function needsRareLeaveConfirm(offers: readonly RewardOffer[]): boolean {
  return offers.some((offer) => offer.item.rarityId === "rare" || offer.item.rarityId === "legendary");
}

export function packAndSealedCounts(run: ExpeditionRunSnapshot): { pack: number; sealed: number } {
  const pack = run.holdings.filter((item) => item.location.kind === "held_by_expedition").length;
  const sealed = run.waypointChest.length;
  return { pack, sealed };
}

export function resolveEquippedInSlot(
  hero: HeroSnapshot,
  holdings: readonly ItemInstance[],
  equipmentSlot: ItemEquipmentSlot
): { slot: EquipmentSlot; item: ItemInstance | undefined } {
  if (equipmentSlot === "relic") {
    const relic1 = itemById(holdings, hero.equipment.relic1);
    if (relic1 !== undefined) return { slot: "relic1", item: relic1 };
    const relic2 = itemById(holdings, hero.equipment.relic2);
    return { slot: "relic2", item: relic2 };
  }
  const slot = equipmentSlot as EquipmentSlot;
  return { slot, item: itemById(holdings, hero.equipment[slot]) };
}

function schoolEligible(hero: HeroSnapshot, item: ItemInstance): boolean {
  const schools = item.mechanicSnapshot.requiredSchools ?? [];
  if (schools.length === 0) return true;
  return schools.some((school) => hero.schools.includes(school));
}

function grantedCardLabel(item: ItemInstance | undefined): string | undefined {
  if (item === undefined) return undefined;
  const cardId = item.mechanicSnapshot.grantedCardId;
  if (cardId !== undefined) return titleCase(cardId.replaceAll("_", " "));
  const inject = deckInjectLines(item.displaySnapshot.description)[0];
  if (inject !== undefined) {
    const match = inject.match(/^(?:Adds to deck:\s*|Learn\s+)(.+?)(?:\s·|$)/i);
    if (match?.[1] !== undefined) return match[1].trim();
    return inject;
  }
  return undefined;
}

function signedDelta(label: string, offer: number, equipped: number): string | undefined {
  const diff = offer - equipped;
  if (diff === 0) return undefined;
  return `${diff > 0 ? "+" : ""}${diff} ${label}`;
}

export function equipCompareDelta(offer: ItemInstance, equipped: ItemInstance | undefined): string | undefined {
  const o = offer.mechanicSnapshot;
  const e = equipped?.mechanicSnapshot;
  const parts: string[] = [];

  const hp = signedDelta("HP", o.maxHpDelta ?? 0, e?.maxHpDelta ?? 0);
  if (hp !== undefined) parts.push(hp);
  const init = signedDelta("init", o.initiativeDelta ?? 0, e?.initiativeDelta ?? 0);
  if (init !== undefined) parts.push(init);
  const stamina = signedDelta("stamina", o.maxStaminaDelta ?? 0, e?.maxStaminaDelta ?? 0);
  if (stamina !== undefined) parts.push(stamina);

  const offerCard = grantedCardLabel(offer);
  const equippedCard = grantedCardLabel(equipped);
  if (offerCard !== equippedCard) {
    if (offerCard !== undefined) parts.push(offerCard);
    else if (equippedCard !== undefined) parts.push(`loses ${equippedCard}`);
  }

  if (parts.length > 0) return parts.join(" · ");
  if (equipped === undefined) {
    return nonInjectEffectLines(offer.displaySnapshot.description)[0];
  }
  return undefined;
}

export interface EquipCompareRow {
  readonly heroId: string;
  readonly heroName: string;
  readonly slotLabel: string;
  readonly equippedName: string | undefined;
  readonly delta: string | undefined;
  readonly line: string;
}

/** Compare gear offer vs each eligible hero's worn piece in the matching slot. */
export function equipCompareRows(
  offer: ItemInstance,
  heroes: readonly HeroSnapshot[],
  holdings: readonly ItemInstance[]
): EquipCompareRow[] {
  const equipmentSlot = offer.mechanicSnapshot.equipmentSlot;
  if (offer.itemKind !== "equipment" || equipmentSlot === undefined) return [];

  const eligible = heroes.filter((hero) => schoolEligible(hero, offer));
  const subjects = eligible.length > 0 ? eligible : heroes.slice(0, 1);

  return subjects.map((hero) => {
    const { slot, item } = resolveEquippedInSlot(hero, holdings, equipmentSlot);
    const delta = equipCompareDelta(offer, item);
    const equippedName = item?.displaySnapshot.name;
    const worn = equippedName ?? "Empty";
    const line = delta !== undefined
      ? `${hero.name} · ${SLOT_LABELS[slot]}: ${worn} · ${delta}`
      : `${hero.name} · ${SLOT_LABELS[slot]}: ${worn}`;
    return {
      heroId: hero.id,
      heroName: hero.name,
      slotLabel: SLOT_LABELS[slot],
      equippedName,
      delta,
      line
    };
  });
}

export function resolveCarrierItem(
  run: ExpeditionRunSnapshot,
  carrierItemId: string | undefined
): ItemInstance | undefined {
  if (carrierItemId === undefined) return undefined;
  return run.holdings.find((item) => item.instanceId === carrierItemId);
}
