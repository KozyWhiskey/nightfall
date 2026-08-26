import type { ContentPack, EffectDefinition } from "./schema.js";

const version = "nightfall.vslice.1" as const;
const display = (name: string, description: string) => ({ name, description });
const common = (id: string, name: string, description: string, tags: string[] = []) => ({ id, contentVersion: version, scope: "build1" as const, tags, display: display(name, description) });
const damage = (amount: number, scaling: "strength" | "intellect" | "none", target: EffectDefinition["target"] = "enemy", damageType: "physical" | "aether" | "ember" | "gloom" = "physical", bypassBlock = false) => ({ kind: "dealDamage" as const, target, damageType, amount, scaling, bypassBlock });
const block = (amount: number, target: EffectDefinition["target"] = "self", duration: "ownerNextTurn" | "ownerSecondTurn" = "ownerNextTurn") => ({ kind: "gainBlock" as const, target, amount, duration });
const nextHit = (amount: number, target: EffectDefinition["target"] = "self") => ({ kind: "grantNextDamageBonus" as const, target, amount });
const condition = (conditionId: "exposed" | "weakened" | "burn" | "stun" | "strain", target: EffectDefinition["target"], stacks = 1, duration = 1) => ({ kind: "applyCondition" as const, target, conditionId, stacks, duration });
const card = (id: string, name: string, kind: "basic" | "attack" | "ability" | "spell", targetSpec: EffectDefinition["target"], effects: EffectDefinition[], cost: { ap: number; mana?: number; stamina?: number }, schools: ("iron" | "bastion" | "aether" | "ember" | "umbra")[] = [], options: { alwaysAvailable?: boolean; learnable?: boolean; rarity?: "salvaged" | "imbued" | "rare"; disposition?: "discard" | "exhaust" } = {}) => ({
  ...common(id, name, `${name} follows the accepted Build 1 effect contract.`, [kind]),
  kind,
  schools,
  cost: { ap: cost.ap, mana: cost.mana ?? 0, stamina: cost.stamina ?? 0 },
  targetSpec,
  effects,
  disposition: options.disposition ?? "discard",
  alwaysAvailable: options.alwaysAvailable ?? false,
  learnable: options.learnable ?? false,
  ...(options.rarity === undefined ? {} : { rarity: options.rarity })
});

const cards = [
  card("vanguard_basic_attack", "Strike", "basic", "enemy", [damage(1, "strength")], { ap: 1 }, [], { alwaysAvailable: true }),
  card("vanguard_basic_block", "Raise Shield", "basic", "self", [block(6)], { ap: 1 }, [], { alwaysAvailable: true }),
  card("weaver_basic_attack", "Staff Strike", "basic", "enemy", [damage(1, "strength")], { ap: 1 }, [], { alwaysAvailable: true }),
  card("weaver_basic_block", "Deflect", "basic", "self", [block(4)], { ap: 1 }, [], { alwaysAvailable: true }),
  card("shield_bash", "Shield Bash", "attack", "enemy", [damage(0, "strength"), condition("weakened", "enemy")], { ap: 1, stamina: 1 }, ["bastion"]),
  card("hold_the_line", "Hold the Line", "ability", "ally", [block(4, "self"), { kind: "createGuard", target: "ally", block: 0 }], { ap: 1, stamina: 1 }, ["bastion"]),
  card("iron_cut", "Iron Cut", "attack", "enemy", [damage(5, "strength")], { ap: 1, stamina: 2 }, ["iron"]),
  card("brace", "Brace", "ability", "self", [block(10)], { ap: 1, stamina: 1 }, ["bastion"]),
  card("aether_bolt", "Aether Bolt", "spell", "enemy", [damage(7, "intellect", "enemy", "aether")], { ap: 1, mana: 2 }, ["aether"]),
  card("ember_spark", "Ember Spark", "spell", "enemy", [damage(0, "intellect", "enemy", "ember"), condition("burn", "enemy", 1, 2)], { ap: 1, mana: 1 }, ["ember"]),
  card("aether_lash", "Aether Lash", "spell", "enemy", [damage(2, "intellect", "enemy", "aether")], { ap: 1, mana: 1 }, ["aether"]),
  card("flare_ward", "Flare Ward", "spell", "self", [block(7)], { ap: 1, mana: 1 }, ["aether"]),
  card("piercing_thrust", "Piercing Thrust", "attack", "enemy", [damage(2, "strength"), condition("exposed", "enemy")], { ap: 1, stamina: 1 }, ["iron"]),
  card("ember_lance", "Ember Lance", "spell", "enemy", [damage(3, "intellect", "enemy", "ember"), condition("burn", "enemy", 1, 2)], { ap: 1, mana: 2 }, ["ember"]),
  card("sundering_stroke", "Sundering Stroke", "attack", "enemy", [damage(1, "strength"), { kind: "removeBlock", target: "enemy", amount: 6 }], { ap: 1, stamina: 1 }, ["iron"], { learnable: true, rarity: "imbued" }),
  card("crack_open", "Crack Open", "attack", "enemy", [damage(4, "strength", "enemy", "physical"), { kind: "dealDamage", target: "enemy", damageType: "physical", amount: 3, scaling: "none", bypassBlock: false, condition: "exposed" }], { ap: 1, stamina: 2 }, ["iron"], { learnable: true, rarity: "rare" }),
  card("still_wall", "Still Wall", "ability", "self", [block(9)], { ap: 1, stamina: 1 }, ["bastion"], { learnable: true, rarity: "salvaged" }),
  card("oathbound_guard", "Oathbound Guard", "ability", "ally", [block(8, "ally"), { kind: "createGuard", target: "ally", block: 0 }], { ap: 1, stamina: 2 }, ["bastion"], { learnable: true, rarity: "imbued" }),
  card("aether_needle", "Aether Needle", "spell", "enemy", [damage(2, "intellect", "enemy", "aether", true)], { ap: 1, mana: 1 }, ["aether"], { learnable: true, rarity: "salvaged" }),
  card("unravel", "Unravel", "spell", "enemy", [damage(0, "intellect", "enemy", "aether"), { kind: "removeBlock", target: "enemy", amount: 6 }], { ap: 1, mana: 1 }, ["aether"], { learnable: true, rarity: "imbued" }),
  card("kindle_wound", "Kindle Wound", "spell", "enemy", [damage(3, "none", "enemy", "ember"), condition("burn", "enemy", 2, 2)], { ap: 1, mana: 1 }, ["ember"], { learnable: true, rarity: "salvaged" }),
  card("ashfall", "Ashfall", "spell", "allEnemies", [damage(0, "intellect", "allEnemies", "ember"), condition("burn", "allEnemies", 1, 2)], { ap: 1, mana: 3 }, ["ember"], { learnable: true, rarity: "rare" }),
  card("black_thread", "Black Thread", "spell", "enemy", [damage(0, "intellect", "enemy", "gloom"), condition("exposed", "enemy")], { ap: 1, mana: 1 }, ["umbra"], { learnable: false, rarity: "imbued" }),
  card("borrowed_moment", "Borrowed Moment", "spell", "self", [{ kind: "grantRetain", target: "self", amount: 1 }], { ap: 1, mana: 1 }, ["umbra"], { learnable: false, rarity: "rare", disposition: "exhaust" }),
  card("wardstrike", "Wardstrike", "attack", "enemy", [damage(3, "strength"), block(4, "self")], { ap: 1, stamina: 2 }, ["iron", "bastion"]),
  card("cinder_arc", "Cinder Arc", "spell", "enemy", [damage(4, "intellect", "enemy", "aether"), condition("burn", "enemy", 1, 2)], { ap: 1, mana: 2 }, ["aether", "ember"]),
  card("lantern_ward", "Lantern Ward", "spell", "self", [block(8)], { ap: 1, mana: 2 }, ["bastion", "ember"])
];

const equipment = (id: string, name: string, slot: "mainHand" | "offHand" | "head" | "body" | "gloves" | "relic", requiredSchools: ("iron" | "bastion" | "aether" | "ember" | "umbra")[], grantedCardId?: string, passiveIds: string[] = []) => ({
  ...common(id, name, `${name} is an approved Build 1 vessel.`, ["equipment", slot.toLowerCase()]), itemKind: "equipment" as const, slot, requiredSchools, ...(grantedCardId === undefined ? {} : { grantedCardId }), passiveIds, allowedAffixFamilies: ["prefix", "suffix", "curse", "signature"] as Array<"prefix" | "suffix" | "curse" | "signature">, heldOnly: false
});
const physicalScroll = (id: string, school: "iron" | "bastion" | "aether" | "ember" | "umbra", heldOnly = false) => ({
  ...common(`scroll_${id}`, `${cards.find((entry) => entry.id === id)?.display.name ?? id} Scroll`, `A physical ${school} pattern.`, ["scroll", school]), itemKind: "scroll" as const, requiredSchools: [school], grantedCardId: id, passiveIds: [], allowedAffixFamilies: [] as Array<"prefix" | "suffix" | "curse" | "signature">, heldOnly
});

const items = [
  equipment("hewn_sword", "Hewn Sword", "mainHand", [], "iron_cut"),
  equipment("gloomwood_spear", "Gloomwood Spear", "mainHand", [], "piercing_thrust"),
  equipment("aether_rod", "Aether Rod", "mainHand", ["aether"], "aether_lash"),
  equipment("cinder_scepter", "Cinder Scepter", "mainHand", ["ember"], "ember_lance"),
  equipment("kite_shield", "Kite Shield", "offHand", [], "brace"),
  equipment("way_lantern_buckler", "Way-lantern Buckler", "offHand", ["aether", "ember"], "flare_ward"),
  equipment("archivists_focus", "Archivist's Focus", "offHand", ["aether"], undefined, ["combat_start_draw"]),
  equipment("cracked_way_lens", "Cracked Way-Lens", "relic", [], undefined, ["spell_damage_flat"]),
  equipment("pilgrims_knot", "Pilgrim's Knot", "relic", [], undefined, ["max_stamina"]),
  equipment("name_thread_charm", "Name-Thread Charm", "relic", [], undefined, ["retain_refill"]),
  equipment("emberglass_cowl", "Emberglass Cowl", "head", [], undefined, ["item_initiative"]),
  equipment("wayfarers_coat", "Wayfarer's Coat", "body", [], undefined, ["max_hp"]),
  equipment("ironweave_gloves", "Ironweave Gloves", "gloves", [], undefined, ["basic_attack_damage"]),
  ...(["sundering_stroke", "crack_open"] as const).map((id) => physicalScroll(id, "iron")),
  ...(["still_wall", "oathbound_guard"] as const).map((id) => physicalScroll(id, "bastion")),
  ...(["aether_needle", "unravel"] as const).map((id) => physicalScroll(id, "aether")),
  ...(["kindle_wound", "ashfall"] as const).map((id) => physicalScroll(id, "ember")),
  physicalScroll("black_thread", "umbra", true),
  physicalScroll("borrowed_moment", "umbra", true),
  { ...common("mana_phial", "Mana Phial", "Restore 4 Mana to one hero.", ["supply"]), itemKind: "supply" as const, requiredSchools: [], passiveIds: [], allowedAffixFamilies: [] as Array<"prefix" | "suffix" | "curse" | "signature">, heldOnly: false },
  { ...common("stamina_draught", "Stamina Draught", "Restore 4 Stamina to one hero.", ["supply"]), itemKind: "supply" as const, requiredSchools: [], passiveIds: [], allowedAffixFamilies: [] as Array<"prefix" | "suffix" | "curse" | "signature">, heldOnly: false },
  { ...common("ash_tonic", "Ash Tonic", "Restore 2 Mana and Stamina, then take 1 direct damage.", ["supply"]), itemKind: "supply" as const, requiredSchools: [], passiveIds: [], allowedAffixFamilies: [] as Array<"prefix" | "suffix" | "curse" | "signature">, heldOnly: false }
];

const affix = (id: string, name: string, affixKind: "prefix" | "suffix" | "curse" | "signature", modifiers: string[], requiredTags: string[] = [], requiresGrantedCard = false, incompatibleIds: string[] = []) => ({
  ...common(id, name, `${name} applies only through validated mechanic modifiers.`, [affixKind]), affixKind, budgetCost: affixKind === "curse" ? 0 : 1, requiresGrantedCard, requiredTags, incompatibleIds, modifiers
});
const affixes = [
  affix("cinderbound", "Cinderbound", "prefix", ["card_burn"], ["attack"], true),
  affix("warded", "Warded", "prefix", ["card_block_plus_2"], ["ability"], true),
  affix("conduit", "Conduit", "prefix", ["spell_damage_plus_1"], ["spell"], true),
  affix("quickened", "Quickened", "prefix", ["initiative_plus_1"]),
  affix("anchored", "Anchored", "prefix", ["retain"], [], true, ["long_vigil"]),
  affix("deepdrawn", "Deepdrawn", "prefix", ["max_secondary_plus_1"]),
  affix("houndmarked", "Houndmarked", "prefix", ["exposed_damage_plus_2"], ["attack"], true),
  affix("lumenforged", "Lumenforged", "prefix", ["first_block_plus_2"]),
  affix("last_watch", "of the Last Watch", "suffix", ["guard_self_block"]),
  affix("cinders", "of Cinders", "suffix", ["first_burn_plus_1"]),
  affix("hound", "of the Hound", "suffix", ["exposed_resource_discount"], ["attack"], true),
  affix("long_vigil", "of the Long Vigil", "suffix", ["retained_resource_discount"], [], true, ["anchored"]),
  affix("broken_gate", "of the Broken Gate", "suffix", ["basic_block_plus_1"]),
  affix("veiled_road", "of the Veiled Road", "suffix", ["combat_start_draw"], [], false, ["archivists_focus"]),
  affix("ashen_names", "of Ashen Names", "suffix", ["ally_downed_block"]),
  affix("waystation", "of the Waystation", "suffix", ["gloom_increase_reduction"]),
  affix("frayed", "Frayed", "curse", ["self_damage_1"], [], true),
  affix("hollow", "Hollow", "curse", ["exhaust"], [], true),
  affix("overdrawn", "Overdrawn", "curse", ["secondary_cost_plus_1"], [], true),
  affix("vigils_promise", "Vigil's Promise", "signature", ["guard_ally_block"]),
  affix("cinder_scar", "Cinder-Scar", "signature", ["burned_enemy_damage_minus_1"]),
  affix("hounds_pursuit", "Hound's Pursuit", "signature", ["exposed_draw"])
];

const intent = (id: string, label: string, weight: number, targetSpec: EffectDefinition["target"], effects: EffectDefinition[], eligibility: "always" | "allyMissingBlock" | "damagedAlly" | "damagingAllyExists" = "always", forcesNextIntentId?: string) => ({ id, label, weight, targetSpec, effects, eligibility, ...(forcesNextIntentId === undefined ? {} : { forcesNextIntentId }) });
const enemy = (id: string, name: string, hp: number, dex: number, intents: ReturnType<typeof intent>[], mode: "weighted_random" | "tactical_weighted" | "scripted_cycle" = "weighted_random") => ({ ...common(id, name, `${name} is part of the accepted Band-1 roster.`, ["enemy", "band_1"]), hp, dex, strength: 0, intellect: 0, intentMode: mode, intents });
const enemies = [
  enemy("gloomfang_hound", "Gloomfang Hound", 20, 5, [intent("lunge", "Lunge", 3, "lowestHpHero", [damage(5, "none", "lowestHpHero")]), intent("raking_bite", "Raking Bite", 2, "lowestHpHero", [damage(3, "none", "lowestHpHero"), condition("exposed", "lowestHpHero")]), intent("circle", "Circle", 1, "self", [block(4), nextHit(2)])]),
  enemy("shattered_husk", "Shattered Husk", 30, 1, [intent("griefswipe", "Griefswipe", 3, "randomLivingHero", [damage(6, "none", "randomLivingHero")]), intent("mourning_blow", "Mourning Blow", 2, "randomLivingHero", [damage(4, "none", "randomLivingHero"), condition("weakened", "randomLivingHero")]), intent("hollow_guard", "Hollow Guard", 2, "self", [block(8)])]),
  enemy("mire_imp", "Mire Imp", 16, 4, [intent("whisper_bolt", "Whisper Bolt", 3, "lowestBlockHero", [damage(4, "none", "lowestBlockHero", "gloom")]), intent("doubt", "Doubt", 2, "lowestBlockHero", [damage(2, "none", "lowestBlockHero", "gloom"), condition("exposed", "lowestBlockHero")]), intent("skitter", "Skitter", 1, "self", [block(5)])]),
  enemy("mist_chanter", "Mist Chanter", 22, 2, [intent("dirge", "Dirge", 3, "allAllies", [block(4, "allAllies")], "allyMissingBlock"), intent("borrowed_fury", "Borrowed Fury", 2, "allAllies", [nextHit(2, "allAllies")], "damagingAllyExists"), intent("lament", "Lament", 1, "allEnemies", [damage(3, "none", "allEnemies", "gloom")])], "tactical_weighted"),
  enemy("gloom_spore", "Gloom Spore", 14, 0, [intent("spore_shot", "Spore Shot", 2, "randomLivingHero", [damage(4, "none", "randomLivingHero", "gloom")]), intent("swell", "Swell", 1, "none", [{ kind: "addExpeditionFlag", target: "none", flagId: "spore_swollen" }], "always", "rupture"), intent("rupture", "Rupture", 1, "allEnemies", [damage(7, "none", "allEnemies", "gloom"), { kind: "dealDirectDamage", target: "self", amount: 99 }])]),
  enemy("lantern_smother", "Lantern-Smother", 110, 2, [intent("raking_fog", "Raking Fog", 1, "lowestBlockHero", [damage(7, "none", "lowestBlockHero", "gloom")]), intent("stolen_voice", "Stolen Voice / Gather Shroud", 1, "lowestHpHero", [damage(4, "none", "lowestHpHero", "gloom"), condition("exposed", "lowestHpHero"), { kind: "createCombatEntity", target: "none", definitionId: "smothering_shroud", hp: 18, targetable: true }]), intent("consume_the_light", "Consume the Light", 1, "allEnemies", [damage(9, "none", "allEnemies", "gloom"), { kind: "changeRunGloom", target: "none", amount: 8 }]), intent("scattered_mist", "Scattered Mist", 1, "allEnemies", [damage(3, "none", "allEnemies", "gloom"), condition("exposed", "self")]), intent("drown_the_spark", "Drown the Spark", 1, "lowestHpHero", [damage(5, "none", "lowestHpHero", "gloom"), condition("weakened", "lowestHpHero")])], "scripted_cycle")
];

const encounterData = [
  ["roadside_trail", "Roadside Trail", ["gloomfang_hound", "gloomfang_hound"], 0],
  ["lost_mile", "Lost Mile", ["mire_imp", "gloomfang_hound"], 0.1],
  ["whisperwood_threshold", "Whisperwood Threshold", ["mist_chanter", "gloomfang_hound", "shattered_husk"], 0.05],
  ["rootbound_remains", "Rootbound Remains", ["shattered_husk", "mire_imp"], 0.18],
  ["houndpack_fog", "Houndpack in the Fog", ["gloomfang_hound", "gloomfang_hound", "mist_chanter"], 0.25],
  ["stalking_choir", "The Stalking Choir", ["gloom_spore", "mist_chanter", "gloomfang_hound"], 0.35],
  ["lantern_approach", "Lantern Approach", ["gloom_spore", "shattered_husk"], 0.1],
  ["return_roadwardens", "Return Roadwardens", ["mire_imp", "gloomfang_hound"], 0],
  ["voice_ambush", "Voice Ambush", ["mire_imp", "gloomfang_hound"], 0]
] as const;
const encounters = encounterData.map(([id, name, enemyIds, carrierChance]) => ({ ...common(id, name, `${name} encounter.`, ["encounter"]), enemyIds: [...enemyIds], rewardSourceId: id, carrierChance }));

const mat = (materialId: string, amount: number) => ({ kind: "grantMaterial" as const, target: "none" as const, materialId, amount });
const gloom = (amount: number) => ({ kind: "changeRunGloom" as const, target: "none" as const, amount });
const flag = (flagId: string) => ({ kind: "addExpeditionFlag" as const, target: "none" as const, flagId });
const eventOption = (id: string, label: string, effects: EffectDefinition[], cost: Record<string, number> = {}, outcomes: { id: string; weight: number; effects: EffectDefinition[] }[] = []) => ({ id, label, cost, effects, outcomes });
const event = (id: string, name: string, options: ReturnType<typeof eventOption>[]) => ({ ...common(id, name, `${name} presents disclosed Build 1 outcomes.`, ["event"]), optionIds: options.map((option) => option.id), options });
const events = [
  event("last_courier", "The Last Courier", [eventOption("escort", "Escort them", [flag("courier_escorted")], { rations: 1 }), eventOption("ledger", "Take the ledger", [flag("courier_ledger"), gloom(8)]), eventOption("feed_lantern", "Feed the lantern", [gloom(-12), flag("next_combat_block")], { emberglass: 1 })]),
  event("fallen_waystation", "The Fallen Waystation", [eventOption("rekindle", "Rekindle the signal", [gloom(-15), flag("next_reward_three")], { emberglass: 2 }), eventOption("salvage_lens", "Salvage the lens", [gloom(5)], {}, [{ id: "clean_relic", weight: 75, effects: [flag("grant_imbued_relic")] }, { id: "frayed_relic", weight: 25, effects: [flag("grant_imbued_relic_frayed")] }]), eventOption("memory_loop", "Enter the memory loop", [], {}, [{ id: "rare_scroll", weight: 65, effects: [flag("grant_rare_scroll")] }, { id: "exposed", weight: 35, effects: [flag("next_combat_exposed")] }])]),
  event("choir_in_the_bark", "Choir in the Bark", [eventOption("free_names", "Carve the names free", [gloom(-10), flag("next_combat_block")], {}, [{ id: "steady", weight: 50, effects: [] }, { id: "strained", weight: 50, effects: [flag("next_combat_one_strain")] }]), eventOption("familiar_voice", "Follow a familiar voice", [], {}, [{ id: "rare_scroll", weight: 40, effects: [flag("grant_rare_scroll")] }, { id: "imbued_relic", weight: 30, effects: [flag("grant_imbued_relic")] }, { id: "ambush", weight: 30, effects: [flag("voice_ambush")] }]), eventOption("black_resin", "Cut the black resin", [flag("unstable_resin")])]),
  event("cache_ember_pit", "Cache: Ember Pit", [eventOption("haul", "Haul carefully", [mat("emberglass", 3), gloom(5), flag("safe_fuse_voucher")]), eventOption("dig", "Dig greedy", [mat("emberglass", 6), gloom(5), { kind: "dealDirectDamage", target: "allAllies", amount: 3 }]), eventOption("toss_scroll", "Toss a scroll into the pit", [flag("free_risky_overbind")], { unlearned_scroll: 1 })]),
  event("returning_echo", "The Returning Echo", [eventOption("fading_lamps", "Follow the fading lamps", [gloom(-8)]), eventOption("roadside_cache", "Take the roadside cache", [mat("salvage", 2), mat("emberglass", 1), gloom(6)]), eventOption("remembered_pattern", "Claim the remembered pattern", [gloom(4), flag("grant_imbued_scroll")])])
];

const recipe = (id: string, name: string, context: "safe_craft" | "cinder_forge" | "event", inputs: Record<string, number>, outcomes: { id: string; weight: number; modifiers: string[] }[]) => ({ ...common(id, name, `${name} consumes disclosed inputs and cannot delete an item.`, ["recipe"]), context, inputs, outcomes });
const recipes = [
  recipe("safe_fuse", "Safe Fuse", "safe_craft", { unlearned_scroll: 2, emberglass: 2 }, [{ id: "desired_hybrid", weight: 75, modifiers: ["hybrid"] }, { id: "hybrid_overdrawn", weight: 25, modifiers: ["hybrid", "overdrawn"] }]),
  recipe("safe_imprint", "Safe Imprint", "cinder_forge", { unlearned_scroll: 1, gear: 1, emberglass: 1 }, [{ id: "desired_imprint", weight: 75, modifiers: ["imprint"] }, { id: "imprint_overdrawn", weight: 25, modifiers: ["imprint", "overdrawn"] }]),
  recipe("risky_overbind", "Risky Overbind", "event", { unlearned_scroll: 1, target: 1, emberglass: 3 }, [{ id: "improvement", weight: 55, modifiers: ["improvement"] }, { id: "improvement_overdrawn", weight: 25, modifiers: ["improvement", "overdrawn"] }, { id: "improvement_frayed", weight: 15, modifiers: ["improvement", "frayed"] }, { id: "improvement_hollow", weight: 5, modifiers: ["improvement", "hollow"] }])
];

const routeNodes = [
  ["haven_gate", "haven", "Haven Gate"], ["combat_1", "combat", "Roadside Trail", "roadside_trail"], ["combat_2", "combat", "Lost Mile", "lost_mile"], ["early_event", "event", "? Early Event", "last_courier"], ["combat_3", "combat", "Whisperwood Threshold", "whisperwood_threshold"], ["rest", "rest", "Last Light Rest"], ["combat_4", "combat", "Rootbound Remains", "rootbound_remains"], ["combat_5", "combat", "Houndpack in the Fog", "houndpack_fog"], ["safe_craft", "safe_craft", "Ruined Forge"], ["deep_event", "event", "? Deep Event", "fallen_waystation"], ["combat_6", "combat", "The Stalking Choir", "stalking_choir"], ["combat_7", "combat", "Lantern Approach", "lantern_approach"], ["boss", "boss", "Lantern-Smother", "lantern_smother"], ["waypoint", "waypoint", "Whisperwood Waypoint", "whisperwood_waypoint"], ["return_combat", "return_combat", "Return Roadwardens", "return_roadwardens"], ["return_event", "return_event", "? Returning Echo", "returning_echo"], ["haven_return", "haven", "Haven"]
] as const;
const routeEdges = [
  ["edge_01", "haven_gate", "combat_1"], ["edge_02", "combat_1", "combat_2"], ["edge_03", "combat_1", "early_event"], ["edge_04", "combat_2", "combat_3"], ["edge_05", "early_event", "combat_3"], ["edge_06", "combat_3", "rest"], ["edge_07", "combat_3", "combat_4"], ["edge_08", "rest", "combat_5"], ["edge_09", "rest", "safe_craft"], ["edge_10", "combat_4", "combat_5"], ["edge_11", "combat_4", "safe_craft"], ["edge_12", "combat_5", "deep_event"], ["edge_13", "combat_5", "combat_6"], ["edge_14", "safe_craft", "deep_event"], ["edge_15", "safe_craft", "combat_6"], ["edge_16", "deep_event", "combat_7"], ["edge_17", "combat_6", "combat_7"], ["edge_18", "combat_7", "boss"], ["edge_19", "boss", "waypoint"], ["edge_20", "waypoint", "return_combat"], ["edge_21", "waypoint", "return_event"], ["edge_22", "return_combat", "haven_return"], ["edge_23", "return_event", "haven_return"]
] as const;
const routes = [{ ...common("unlit_road", "The Unlit Road", "The accepted Band-1 route from Haven to Whisperwood and home.", ["route", "band_1"]), nodes: routeNodes.map(([id, type, label, contentId]) => ({ id, type, label, ...(contentId === undefined ? {} : { contentId }) })), edges: routeEdges.map(([id, from, to]) => ({ id, from, to, runGloomCost: 5 as const })) }];

const encounterRewards = {
  roadside_trail: { automatic: { salvage: 2, emberglass: 1, timber: 1, stone: 1, rations: 1 }, offerKinds: ["gear", "scroll"], carrierChance: 0 },
  lost_mile: { automatic: { salvage: 2, emberglass: 1, timber: 1, stone: 1 }, offerKinds: ["scroll", "scroll"], carrierChance: 0.1 },
  whisperwood_threshold: { automatic: { salvage: 2, emberglass: 1, timber: 1, stone: 1 }, offerKinds: ["gear", "scroll"], carrierChance: 0.05 },
  rootbound_remains: { automatic: { salvage: 3, emberglass: 1, timber: 1, stone: 1 }, offerKinds: ["gear", "gear"], carrierChance: 0.18 },
  houndpack_fog: { automatic: { salvage: 3, emberglass: 2, timber: 1, stone: 1 }, offerKinds: ["scroll", "scroll"], carrierChance: 0.25 },
  stalking_choir: { automatic: { salvage: 4, emberglass: 2, timber: 1, stone: 1 }, offerKinds: ["gear", "scroll"], carrierChance: 0.35 },
  lantern_approach: { automatic: { salvage: 4, emberglass: 2, timber: 1, stone: 1 }, offerKinds: ["gear", "supply"], carrierChance: 0.1 },
  return_roadwardens: { automatic: { salvage: 2, emberglass: 1, timber: 1, stone: 1 }, offerKinds: ["gear", "scroll"], carrierChance: 0 },
  voice_ambush: { automatic: { salvage: 2, emberglass: 1 }, offerKinds: ["gear", "scroll"], carrierChance: 0 }
} satisfies ContentPack["tuning"]["encounterRewards"];

export const rawBuild1Pack = {
  contentVersion: version,
  classes: [
    { ...common("vanguard", "Vanguard", "A reliable protector who turns Stamina into decisive defense.", ["class"]), schools: ["iron", "bastion"], attributes: { vit: 4, dex: 3, str: 4, int: 1 }, basePools: { hp: 22, stamina: 6, mana: 2 }, classCardIds: ["shield_bash", "hold_the_line"], starterItemIds: ["hewn_sword", "kite_shield"], basicActionIds: ["vanguard_basic_attack", "vanguard_basic_block"] },
    { ...common("aether_weaver", "Aether Weaver", "A lantern-mage who spends Mana for Aether and Ember pressure.", ["class"]), schools: ["aether", "ember"], attributes: { vit: 4, dex: 5, str: 2, int: 4 }, basePools: { hp: 12, stamina: 2, mana: 6 }, classCardIds: ["aether_bolt", "ember_spark"], starterItemIds: ["aether_rod", "way_lantern_buckler"], basicActionIds: ["weaver_basic_attack", "weaver_basic_block"] }
  ],
  cards,
  items,
  affixes,
  enemies,
  encounters,
  events,
  recipes,
  routes,
  tuning: {
    initiativeVariance: { min: 1, max: 4 }, victoryRecoveryPercent: 50, gloomTouchedBlock: 3, travelGloom: 5, restGloomReduction: 12, handSize: 3, heroAp: 3, temporaryLevelCombatWins: 3,
    encounterRewards,
    buildings: { cinder_forge: { timber: 7, stone: 5, wick: 1 }, quiet_house: { timber: 5, stone: 7, wick: 1 }, wardyard: { timber: 6, stone: 6, wick: 1 } }
  }
} satisfies ContentPack;
