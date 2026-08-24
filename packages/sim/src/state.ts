import { SNAPSHOT_SCHEMA_VERSION, type EquipmentSlot, type GameSnapshot, type HeroSnapshot, type ItemInstance, type RouteNodeSnapshot } from "@nightfall/contracts";
import type { ClassDefinition, ValidatedContentPack } from "@nightfall/content";
import { createItemInstance } from "./items.js";
import { createNamedRngStates } from "./rng.js";

const emptyEquipment = (): Record<EquipmentSlot, string | null> => ({ mainHand: null, offHand: null, head: null, body: null, gloves: null, legs: null, feet: null, relic1: null, relic2: null });

export function deriveHeroPools(definition: ClassDefinition, attributes: HeroSnapshot["attributes"], equipmentItems: readonly ItemInstance[] = []): Pick<HeroSnapshot, "maxHp" | "maxMana" | "maxStamina"> {
  const itemHp = equipmentItems.reduce((sum, item) => sum + (item.mechanicSnapshot.maxHpDelta ?? 0), 0);
  const itemMana = equipmentItems.reduce((sum, item) => sum + (item.mechanicSnapshot.maxManaDelta ?? 0), 0);
  const itemStamina = equipmentItems.reduce((sum, item) => sum + (item.mechanicSnapshot.maxStaminaDelta ?? 0), 0);
  return {
    maxHp: definition.basePools.hp + attributes.vit * 3 + itemHp,
    maxMana: definition.basePools.mana + attributes.int + itemMana,
    maxStamina: definition.basePools.stamina + attributes.str + itemStamina
  };
}

/** Absolute maxima from class + attributes + equipped deltas. Raises do not refill; lowers clamp current pools. */
export function applyEquippedPools(
  pack: ValidatedContentPack,
  hero: {
    id: string;
    classId: string;
    attributes: HeroSnapshot["attributes"];
    maxHp: number;
    hp: number;
    maxMana: number;
    mana: number;
    maxStamina: number;
    stamina: number;
  },
  holdings: readonly ItemInstance[]
): void {
  const definition = pack.classes.find((entry) => entry.id === hero.classId);
  if (definition === undefined) throw new Error(`Missing class ${hero.classId}`);
  const equipped = holdings.filter((item) => item.location.kind === "equipped" && item.location.heroId === hero.id);
  const pools = deriveHeroPools(definition, hero.attributes, equipped);
  hero.maxHp = pools.maxHp;
  hero.maxMana = pools.maxMana;
  hero.maxStamina = pools.maxStamina;
  hero.hp = Math.min(hero.hp, hero.maxHp);
  hero.mana = Math.min(hero.mana, hero.maxMana);
  hero.stamina = Math.min(hero.stamina, hero.maxStamina);
}

export function createHero(pack: ValidatedContentPack, classId: "vanguard" | "aether_weaver", id: string, name: string): HeroSnapshot {
  const definition = pack.classes.find((entry) => entry.id === classId);
  if (definition === undefined) throw new Error(`Missing class ${classId}`);
  const attributes = { ...definition.attributes };
  const pools = deriveHeroPools(definition, attributes);
  return {
    id,
    name,
    classId,
    schools: [...definition.schools],
    attributes,
    ...pools,
    hp: pools.maxHp,
    mana: pools.maxMana,
    stamina: pools.maxStamina,
    equipment: emptyEquipment(),
    learnedCardIds: [],
    runLearnedCardIds: [],
    injuries: [],
    pendingLeadership: 0,
    downed: false
  };
}

function equipStarterItems(pack: ValidatedContentPack, heroes: HeroSnapshot[], havenId: string, seed: number): ItemInstance[] {
  const items: ItemInstance[] = [];
  let sequence = 0;
  for (const hero of heroes) {
    const definition = pack.classes.find((entry) => entry.id === hero.classId)!;
    definition.starterItemIds.forEach((itemId, itemIndex) => {
      const slot: EquipmentSlot = itemIndex === 0 ? "mainHand" : "offHand";
      const instanceId = `${havenId}_${hero.id}_${itemId}`;
      const item = createItemInstance(pack, itemId, "salvaged", seed + sequence, instanceId, { kind: "equipped", heroId: hero.id, slotId: slot });
      (hero.equipment as Record<EquipmentSlot, string | null>)[slot] = instanceId;
      items.push(item);
      sequence += 1;
    });
  }
  return items;
}

export function createFoundingParty(pack: ValidatedContentPack, havenId: string, sequence: number, seed: number): { heroes: HeroSnapshot[]; holdings: ItemInstance[] } {
  const heroes = [createHero(pack, "vanguard", `vanguard_${sequence}`, sequence === 1 ? "Rook" : `Rook ${sequence}`,), createHero(pack, "aether_weaver", `weaver_${sequence}`, sequence === 1 ? "Mara" : `Mara ${sequence}`)];
  const holdings = equipStarterItems(pack, heroes, havenId, seed);
  return { heroes, holdings };
}

export function createInitialSnapshot(pack: ValidatedContentPack, rootSeed: number, havenName = "The Last Lantern"): GameSnapshot {
  const havenId = "haven_1";
  const party = createFoundingParty(pack, havenId, 1, rootSeed);
  return {
    schemaVersion: SNAPSHOT_SCHEMA_VERSION,
    contentVersion: pack.contentVersion,
    contentHash: pack.contentHash,
    revision: 0,
    rngStates: createNamedRngStates(rootSeed),
    campaign: {
      campaignId: "campaign_1",
      currentHavenId: havenId,
      havenSequence: 1,
      claimedWaypointIds: [],
      settlementTraceIds: [],
      blueprintIds: [],
      discoveryIds: [],
      memorials: [],
      fallenHavenIds: []
    },
    haven: {
      id: havenId,
      name: havenName,
      locationId: "cinder_refuge",
      pillarCapacity: 10,
      litPillars: 10,
      gloom: 0,
      resources: { salvage: 0, emberglass: 0, rations: 0, timber: 0, stone: 0, wick: 0, ember_shard: 0 },
      buildings: [
        { id: "pillarhouse", state: "built" },
        { id: "cinder_forge", state: "available" },
        { id: "quiet_house", state: "available" },
        { id: "wardyard", state: "available" },
        { id: "ember_vault", state: "unavailable" },
        { id: "wayfarer", state: "unavailable" }
      ],
      heroes: party.heroes,
      holdings: party.holdings,
      memorialAcknowledged: true
    },
    view: "haven",
    latestFacts: []
  };
}

export function createRouteNodes(pack: ValidatedContentPack): RouteNodeSnapshot[] {
  const route = pack.routes.find((entry) => entry.id === "unlit_road")!;
  return route.nodes.map((node) => ({
    ...node,
    visibility: node.type === "event" || node.type === "return_event" ? "hidden" : "category_revealed",
    state: node.id === "haven_gate" ? "resolved" : node.id === "combat_1" ? "available" : "locked"
  }));
}
