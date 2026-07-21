import { createHash } from "node:crypto";
import type { ItemInstance } from "@nightfall/contracts";
import { contentPackSchema, type AffixDefinition, type ContentPack, type ItemDefinition } from "./schema.js";

export interface ValidatedContentPack extends ContentPack {
  readonly contentHash: string;
}

export class ContentValidationError extends Error {
  public readonly issues: readonly string[];

  public constructor(issues: readonly string[]) {
    super(`Content pack rejected:\n${issues.join("\n")}`);
    this.name = "ContentValidationError";
    this.issues = issues;
  }
}

function canonicalValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalValue);
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).filter(([, entry]) => entry !== undefined).sort(([a], [b]) => a.localeCompare(b)).map(([key, entry]) => [key, canonicalValue(entry)]));
  }
  return value;
}

export function canonicalSerialize(value: unknown): string {
  return JSON.stringify(canonicalValue(value));
}

export function hashCanonicalContent(value: unknown): string {
  return createHash("sha256").update(canonicalSerialize(value)).digest("hex");
}

function deepFreeze<T>(value: T): T {
  if (value !== null && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const nested of Object.values(value)) deepFreeze(nested);
  }
  return value;
}

function duplicates(ids: readonly string[]): string[] {
  const seen = new Set<string>();
  return ids.filter((id) => seen.size === seen.add(id).size);
}

export function validateContentPack(input: unknown): ValidatedContentPack {
  const parsed = contentPackSchema.safeParse(input);
  if (!parsed.success) {
    throw new ContentValidationError(parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`));
  }

  const pack = parsed.data;
  const issues: string[] = [];
  const groups = [pack.classes, pack.cards, pack.items, pack.affixes, pack.enemies, pack.encounters, pack.events, pack.recipes, pack.routes];
  const duplicateIds = duplicates(groups.flatMap((group) => group.map((definition) => definition.id)));
  if (duplicateIds.length > 0) issues.push(`Duplicate IDs: ${duplicateIds.join(", ")}`);

  const cardIds = new Set(pack.cards.map((entry) => entry.id));
  const itemIds = new Set(pack.items.map((entry) => entry.id));
  const enemyIds = new Set(pack.enemies.map((entry) => entry.id));
  const encounterIds = new Set(pack.encounters.map((entry) => entry.id));
  const eventIds = new Set(pack.events.map((entry) => entry.id));
  const recipeIds = new Set(pack.recipes.map((entry) => entry.id));

  for (const definition of pack.classes) {
    for (const id of [...definition.classCardIds, ...definition.basicActionIds]) if (!cardIds.has(id)) issues.push(`${definition.id} references unknown card ${id}`);
    for (const id of definition.starterItemIds) if (!itemIds.has(id)) issues.push(`${definition.id} references unknown item ${id}`);
  }
  for (const definition of pack.items) {
    if (definition.grantedCardId !== undefined && !cardIds.has(definition.grantedCardId)) issues.push(`${definition.id} references unknown granted card ${definition.grantedCardId}`);
    if (definition.heldOnly && definition.requiredSchools.every((school) => school !== "umbra")) issues.push(`${definition.id} is held-only without a future school`);
  }
  for (const definition of pack.cards) {
    if (definition.learnable && definition.schools.includes("umbra")) issues.push(`${definition.id} uses the future Umbra school as learnable Build 1 content`);
  }
  for (const definition of pack.encounters) {
    for (const id of definition.enemyIds) if (!enemyIds.has(id)) issues.push(`${definition.id} references unknown enemy ${id}`);
    if (!(definition.rewardSourceId in pack.tuning.encounterRewards)) issues.push(`${definition.id} lacks tuning for reward source ${definition.rewardSourceId}`);
  }
  for (const definition of pack.enemies) {
    const intentIds = new Set(definition.intents.map((entry) => entry.id));
    for (const intentDefinition of definition.intents) if (intentDefinition.forcesNextIntentId !== undefined && !intentIds.has(intentDefinition.forcesNextIntentId)) issues.push(`${definition.id}.${intentDefinition.id} forces unknown intent ${intentDefinition.forcesNextIntentId}`);
  }
  for (const definition of pack.events) {
    if (definition.optionIds.join("|") !== definition.options.map((entry) => entry.id).join("|")) issues.push(`${definition.id} option IDs do not match definitions`);
    if (definition.id === "survivor_lantern_child") issues.push("Archived event survivor_lantern_child is forbidden");
  }
  for (const route of pack.routes) {
    const nodeIds = new Set(route.nodes.map((node) => node.id));
    for (const edge of route.edges) if (!nodeIds.has(edge.from) || !nodeIds.has(edge.to)) issues.push(`${route.id}.${edge.id} has an unknown endpoint`);
    for (const node of route.nodes) {
      if (node.contentId === undefined) continue;
      if (node.type === "combat" || node.type === "return_combat") { if (!encounterIds.has(node.contentId)) issues.push(`${node.id} references unknown encounter ${node.contentId}`); }
      if (node.type === "event" || node.type === "return_event") { if (!eventIds.has(node.contentId)) issues.push(`${node.id} references unknown event ${node.contentId}`); }
      if (node.type === "boss" && !enemyIds.has(node.contentId)) issues.push(`${node.id} references unknown boss ${node.contentId}`);
    }
    const types = new Set(route.nodes.map((node) => node.type));
    for (const required of ["boss", "waypoint", "return_combat", "return_event"] as const) if (!types.has(required)) issues.push(`${route.id} is missing ${required}`);
  }
  if (!recipeIds.has("safe_fuse") || !recipeIds.has("safe_imprint") || !recipeIds.has("risky_overbind")) issues.push("Build 1 craft registry is incomplete");

  if (issues.length > 0) throw new ContentValidationError(issues);
  const withHash = { ...pack, contentHash: hashCanonicalContent(pack) };
  return deepFreeze(withHash);
}

export function validateAffixCompatibility(item: ItemDefinition, affixes: readonly AffixDefinition[]): void {
  const issues: string[] = [];
  const ids = new Set(affixes.map((entry) => entry.id));
  for (const affix of affixes) {
    if (affix.requiresGrantedCard && item.grantedCardId === undefined) issues.push(`${affix.id} requires a granted card on ${item.id}`);
    for (const incompatibleId of affix.incompatibleIds) if (ids.has(incompatibleId)) issues.push(`${affix.id} is incompatible with ${incompatibleId}`);
  }
  const handModules = affixes.filter((entry) => entry.modifiers.some((modifier) => modifier.includes("draw") || modifier.includes("retain")));
  if (handModules.length > 1) issues.push(`${item.id} has more than one draw/Retain module`);
  if (issues.length > 0) throw new ContentValidationError(issues);
}

export function validateItemOwnership(items: readonly ItemInstance[], knownItemIds?: ReadonlySet<string>): void {
  const seen = new Set<string>();
  const issues: string[] = [];
  for (const item of items) {
    if (seen.has(item.instanceId)) issues.push(`Item ${item.instanceId} has duplicate locations`);
    seen.add(item.instanceId);
    if (knownItemIds !== undefined && !knownItemIds.has(item.definitionId)) issues.push(`Item ${item.instanceId} references unknown definition ${item.definitionId}`);
  }
  if (issues.length > 0) throw new ContentValidationError(issues);
}
