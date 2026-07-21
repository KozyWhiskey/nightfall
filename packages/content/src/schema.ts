import { z } from "zod";

export const idSchema = z.string().regex(/^[a-z][a-z0-9_.]*$/);
export const scopeSchema = z.enum(["build1", "future"]);
export const schoolSchema = z.enum(["iron", "bastion", "aether", "ember", "umbra"]);
export const targetSchema = z.enum([
  "none",
  "self",
  "ally",
  "enemy",
  "allAllies",
  "allEnemies",
  "allCombatants",
  "lowestHpHero",
  "lowestBlockHero",
  "randomLivingHero"
]);

const baseEffect = z.object({
  target: targetSchema,
  condition: z.string().optional()
});

export const effectSchema = z.discriminatedUnion("kind", [
  baseEffect.extend({ kind: z.literal("dealDamage"), damageType: z.enum(["physical", "aether", "ember", "gloom"]), amount: z.number().int().nonnegative(), scaling: z.enum(["strength", "intellect", "none"]), bypassBlock: z.boolean().default(false) }),
  baseEffect.extend({ kind: z.literal("dealDirectDamage"), amount: z.number().int().nonnegative() }),
  baseEffect.extend({ kind: z.literal("gainBlock"), amount: z.number().int().nonnegative(), duration: z.enum(["ownerNextTurn", "ownerSecondTurn"]).default("ownerNextTurn") }),
  baseEffect.extend({ kind: z.literal("removeBlock"), amount: z.number().int().nonnegative() }),
  baseEffect.extend({ kind: z.literal("applyCondition"), conditionId: z.enum(["exposed", "weakened", "burn", "stun", "strain"]), stacks: z.number().int().positive().default(1), duration: z.number().int().positive().default(1) }),
  baseEffect.extend({ kind: z.literal("removeCondition"), conditionId: z.enum(["exposed", "weakened", "burn", "stun", "strain"]) }),
  baseEffect.extend({ kind: z.literal("createGuard"), block: z.number().int().nonnegative().default(0) }),
  baseEffect.extend({ kind: z.literal("grantNextDamageBonus"), amount: z.number().int().positive() }),
  baseEffect.extend({ kind: z.literal("drawCards"), amount: z.number().int().positive() }),
  baseEffect.extend({ kind: z.literal("grantRetain"), amount: z.number().int().positive().default(1) }),
  baseEffect.extend({ kind: z.literal("exhaustCard") }),
  baseEffect.extend({ kind: z.literal("restoreResource"), resource: z.enum(["mana", "stamina"]), amount: z.number().int().positive() }),
  baseEffect.extend({ kind: z.literal("heal"), amount: z.number().nonnegative(), percentMax: z.boolean().default(false), revive: z.boolean().default(false) }),
  baseEffect.extend({ kind: z.literal("changeRunGloom"), amount: z.number().int() }),
  baseEffect.extend({ kind: z.literal("grantMaterial"), materialId: idSchema, amount: z.number().int().positive() }),
  baseEffect.extend({ kind: z.literal("addExpeditionFlag"), flagId: idSchema }),
  baseEffect.extend({ kind: z.literal("grantBlueprint"), blueprintId: idSchema }),
  baseEffect.extend({ kind: z.literal("grantDiscovery"), discoveryId: idSchema }),
  baseEffect.extend({ kind: z.literal("createCombatEntity"), definitionId: idSchema, hp: z.number().int().positive(), targetable: z.boolean() })
]);

export const displaySchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1)
});

export const commonDefinitionSchema = z.object({
  id: idSchema,
  contentVersion: z.string().min(1),
  scope: scopeSchema,
  tags: z.array(idSchema),
  display: displaySchema
});

export const cardSchema = commonDefinitionSchema.extend({
  kind: z.enum(["basic", "attack", "ability", "spell"]),
  schools: z.array(schoolSchema),
  cost: z.object({ ap: z.number().int().nonnegative(), mana: z.number().int().nonnegative().default(0), stamina: z.number().int().nonnegative().default(0) }),
  targetSpec: targetSchema,
  effects: z.array(effectSchema).min(1),
  disposition: z.enum(["discard", "exhaust"]),
  alwaysAvailable: z.boolean().default(false),
  learnable: z.boolean().default(false),
  rarity: z.enum(["salvaged", "imbued", "rare", "legendary"]).optional()
}).superRefine((card, context) => {
  if (!card.alwaysAvailable && card.cost.ap < 1) context.addIssue({ code: "custom", message: "Non-Basic cards cost at least 1 AP" });
  if (card.effects.some((effect) => effect.target !== card.targetSpec && effect.target !== "self" && effect.target !== "none")) {
    context.addIssue({ code: "custom", message: "Effect target is incompatible with card target" });
  }
});

export const classSchema = commonDefinitionSchema.extend({
  schools: z.array(schoolSchema),
  attributes: z.object({ vit: z.number().int().positive(), dex: z.number().int().positive(), str: z.number().int().positive(), int: z.number().int().positive() }),
  basePools: z.object({ hp: z.number().int().positive(), stamina: z.number().int().nonnegative(), mana: z.number().int().nonnegative() }),
  classCardIds: z.array(idSchema).length(2),
  starterItemIds: z.array(idSchema).length(2),
  basicActionIds: z.array(idSchema).length(2)
});

export const itemSchema = commonDefinitionSchema.extend({
  itemKind: z.enum(["equipment", "scroll", "supply"]),
  slot: z.enum(["mainHand", "offHand", "head", "body", "gloves", "legs", "feet", "relic"]).optional(),
  requiredSchools: z.array(schoolSchema),
  grantedCardId: idSchema.optional(),
  passiveIds: z.array(idSchema),
  allowedAffixFamilies: z.array(z.enum(["prefix", "suffix", "curse", "signature"])),
  heldOnly: z.boolean().default(false)
}).superRefine((item, context) => {
  if (item.itemKind === "equipment" && item.slot === undefined) context.addIssue({ code: "custom", message: "Equipment requires a slot" });
  if (item.itemKind !== "equipment" && item.slot !== undefined) context.addIssue({ code: "custom", message: "Non-equipment cannot declare a slot" });
});

export const affixSchema = commonDefinitionSchema.extend({
  affixKind: z.enum(["prefix", "suffix", "curse", "signature"]),
  budgetCost: z.number().int().nonnegative(),
  requiresGrantedCard: z.boolean().default(false),
  requiredTags: z.array(idSchema),
  incompatibleIds: z.array(idSchema),
  modifiers: z.array(idSchema).min(1)
});

export const intentSchema = z.object({
  id: idSchema,
  label: z.string().min(1),
  weight: z.number().int().positive(),
  targetSpec: targetSchema,
  effects: z.array(effectSchema).min(1),
  eligibility: z.enum(["always", "allyMissingBlock", "damagedAlly", "damagingAllyExists"]).default("always"),
  forcesNextIntentId: idSchema.optional()
});

export const enemySchema = commonDefinitionSchema.extend({
  hp: z.number().int().positive(),
  dex: z.number().int().nonnegative(),
  strength: z.number().int().nonnegative(),
  intellect: z.number().int().nonnegative(),
  intentMode: z.enum(["weighted_random", "tactical_weighted", "scripted_cycle"]),
  intents: z.array(intentSchema).min(1)
});

export const encounterSchema = commonDefinitionSchema.extend({
  enemyIds: z.array(idSchema).min(1).max(5),
  rewardSourceId: idSchema,
  carrierChance: z.number().min(0).max(1)
});

export const eventOutcomeSchema = z.object({
  id: idSchema,
  weight: z.number().positive(),
  effects: z.array(effectSchema)
});

export const eventOptionSchema = z.object({
  id: idSchema,
  label: z.string().min(1),
  cost: z.record(idSchema, z.number().int().nonnegative()),
  effects: z.array(effectSchema),
  outcomes: z.array(eventOutcomeSchema)
}).superRefine((option, context) => {
  if (option.outcomes.length > 0 && option.outcomes.reduce((sum, outcome) => sum + outcome.weight, 0) !== 100) {
    context.addIssue({ code: "custom", message: "Event outcome weights must total 100" });
  }
});

export const eventSchema = commonDefinitionSchema.extend({
  optionIds: z.array(idSchema).min(1),
  options: z.array(eventOptionSchema).min(1)
});

export const recipeSchema = commonDefinitionSchema.extend({
  context: z.enum(["safe_craft", "cinder_forge", "event"]),
  inputs: z.record(idSchema, z.number().int().nonnegative()),
  outcomes: z.array(z.object({ id: idSchema, weight: z.number().positive(), modifiers: z.array(idSchema) })).min(1)
}).superRefine((recipe, context) => {
  if (recipe.outcomes.reduce((sum, outcome) => sum + outcome.weight, 0) !== 100) {
    context.addIssue({ code: "custom", message: "Craft outcome weights must total 100" });
  }
});

export const routeNodeSchema = z.object({ id: idSchema, type: z.enum(["haven", "combat", "event", "rest", "safe_craft", "boss", "waypoint", "return_combat", "return_event"]), label: z.string(), contentId: idSchema.optional() });
export const routeEdgeSchema = z.object({ id: idSchema, from: idSchema, to: idSchema, runGloomCost: z.literal(5) });
export const routeSchema = commonDefinitionSchema.extend({ nodes: z.array(routeNodeSchema), edges: z.array(routeEdgeSchema) });

export const tuningSchema = z.object({
  initiativeVariance: z.object({ min: z.literal(1), max: z.literal(4) }),
  victoryRecoveryPercent: z.literal(50),
  gloomTouchedBlock: z.literal(3),
  travelGloom: z.literal(5),
  restGloomReduction: z.literal(12),
  handSize: z.literal(3),
  heroAp: z.literal(3),
  temporaryLevelCombatWins: z.literal(3),
  encounterRewards: z.record(idSchema, z.object({ automatic: z.record(idSchema, z.number().int().nonnegative()), offerKinds: z.array(z.enum(["gear", "scroll", "supply"])).min(2), carrierChance: z.number().min(0).max(1) })),
  buildings: z.record(idSchema, z.object({ timber: z.number().int().nonnegative(), stone: z.number().int().nonnegative(), wick: z.number().int().nonnegative() }))
});

export const contentPackSchema = z.object({
  contentVersion: z.literal("nightfall.vslice.1"),
  classes: z.array(classSchema).length(2),
  cards: z.array(cardSchema),
  items: z.array(itemSchema),
  affixes: z.array(affixSchema),
  enemies: z.array(enemySchema).length(6),
  encounters: z.array(encounterSchema).length(9),
  events: z.array(eventSchema).length(5),
  recipes: z.array(recipeSchema).length(3),
  routes: z.array(routeSchema).length(1),
  tuning: tuningSchema
});

export type EffectDefinition = z.infer<typeof effectSchema>;
export type CardDefinition = z.infer<typeof cardSchema>;
export type ClassDefinition = z.infer<typeof classSchema>;
export type ItemDefinition = z.infer<typeof itemSchema>;
export type AffixDefinition = z.infer<typeof affixSchema>;
export type EnemyDefinition = z.infer<typeof enemySchema>;
export type IntentDefinition = z.infer<typeof intentSchema>;
export type EncounterDefinition = z.infer<typeof encounterSchema>;
export type EventDefinition = z.infer<typeof eventSchema>;
export type RecipeDefinition = z.infer<typeof recipeSchema>;
export type RouteDefinition = z.infer<typeof routeSchema>;
export type ContentPack = z.infer<typeof contentPackSchema>;
