export const SNAPSHOT_SCHEMA_VERSION = 1 as const;

export const RNG_STREAM_NAMES = [
  "map",
  "encounter",
  "combatInitiative",
  "combatIntent",
  "combatTarget",
  "combatDeck",
  "loot",
  "craft",
  "event",
  "injury"
] as const;

export type RngStreamName = (typeof RNG_STREAM_NAMES)[number];
export type NamedRngStates = Record<RngStreamName, number>;

export const COMMAND_TYPES = [
  "nameHaven",
  "commitEmbark",
  "chooseMapEdge",
  "engageCombat",
  "playCard",
  "useBasicAttack",
  "useBasicBlock",
  "useSupply",
  "endTurn",
  "chooseReward",
  "leaveReward",
  "chooseEventOption",
  "chooseRestOption",
  "chooseCraftRecipe",
  "cancelCraft",
  "assignTemporaryStat",
  "equipItem",
  "unequipItem",
  "learnScroll",
  "spendEmberShardRite",
  "sealChestItem",
  "chooseReturnEdge",
  "assignLeadership",
  "buildBuilding",
  "repairPillar",
  "continueToHaven",
  "abandonExpedition"
] as const;

export type CommandType = (typeof COMMAND_TYPES)[number];

export interface CommandEnvelope<TPayload extends Record<string, unknown> = Record<string, unknown>> {
  readonly commandId: string;
  readonly expectedRevision: number;
  readonly type: CommandType;
  readonly actorId?: string;
  readonly payload: TPayload;
}

export const REASON_CODES = [
  "stale_revision",
  "duplicate_command_conflict",
  "invalid_command",
  "invalid_phase",
  "invalid_actor",
  "invalid_target",
  "insufficient_ap",
  "insufficient_resource",
  "item_unavailable",
  "item_ineligible",
  "not_players_turn",
  "unknown_content_id",
  "content_mismatch",
  "save_unmigratable",
  "terminal_already_resolved"
] as const;

export type ReasonCode = (typeof REASON_CODES)[number];

export interface ResolvedFact {
  readonly id: string;
  readonly kind: string;
  readonly message: string;
  readonly data: Readonly<Record<string, string | number | boolean | null>>;
}

export interface AcceptedCommandResult {
  readonly status: "accepted";
  readonly commandId: string;
  readonly revision: number;
  readonly snapshot: GameSnapshot;
  readonly facts: readonly ResolvedFact[];
  readonly resolvedEventHash: string;
}

export interface RejectedCommandResult {
  readonly status: "rejected";
  readonly commandId: string;
  readonly reasonCode: ReasonCode;
  readonly revision: number;
  readonly snapshot?: GameSnapshot;
}

export type CommandResult = AcceptedCommandResult | RejectedCommandResult;

export type SnapshotListener = (snapshot: GameSnapshot) => void;
export type Unsubscribe = () => void;

export interface GameHost {
  getSnapshot(): Promise<GameSnapshot>;
  submit(command: CommandEnvelope): Promise<CommandResult>;
  subscribe(listener: SnapshotListener): Unsubscribe;
}

export type AttributeId = "vit" | "dex" | "str" | "int";

export interface Attributes {
  vit: number;
  dex: number;
  str: number;
  int: number;
}

export type EquipmentSlot =
  | "mainHand"
  | "offHand"
  | "head"
  | "body"
  | "gloves"
  | "legs"
  | "feet"
  | "relic1"
  | "relic2";

export type ItemLocation =
  | { kind: "haven"; havenId: string }
  | { kind: "held_by_expedition"; runId: string }
  | { kind: "equipped"; heroId: string; slotId: EquipmentSlot }
  | { kind: "sealed_in_waypoint"; waypointId: string }
  | { kind: "carried_by_enemy"; enemyId: string }
  | { kind: "consumed" }
  | { kind: "lost" };

export type ItemEquipmentSlot =
  | "mainHand"
  | "offHand"
  | "head"
  | "body"
  | "gloves"
  | "legs"
  | "feet"
  | "relic";

export interface ItemMechanicSnapshot {
  readonly modifiers: readonly string[];
  readonly grantedCardId?: string;
  readonly equipmentSlot?: ItemEquipmentSlot;
  readonly requiredSchools?: readonly string[];
  readonly school?: string;
  readonly secondaryCostDelta?: number;
  readonly damageDelta?: number;
  readonly blockDelta?: number;
  readonly initiativeDelta?: number;
  readonly maxHpDelta?: number;
  readonly maxManaDelta?: number;
  readonly maxStaminaDelta?: number;
  readonly retain?: boolean;
  readonly exhaust?: boolean;
  readonly selfDamage?: number;
}

export interface ItemInstance {
  readonly instanceId: string;
  readonly definitionId: string;
  readonly itemKind: "equipment" | "scroll" | "supply" | "material" | "currency" | "ember_shard";
  readonly generationVersion: string;
  readonly seed: number;
  readonly rarityId: "salvaged" | "imbued" | "rare" | "legendary";
  readonly prefixIds: readonly string[];
  readonly suffixIds: readonly string[];
  readonly curseId?: string;
  readonly signatureId?: string;
  readonly mechanicSnapshot: ItemMechanicSnapshot;
  readonly displaySnapshot: { readonly name: string; readonly description: string };
  readonly location: ItemLocation;
}

export interface DeckCardPreviewSnapshot {
  readonly cardId: string;
  readonly name: string;
  readonly apCost: number;
  readonly manaCost: number;
  readonly staminaCost: number;
  readonly summary: string;
  readonly sourceLabel: string;
}

export interface HeroSnapshot {
  readonly id: string;
  readonly name: string;
  readonly classId: "vanguard" | "aether_weaver";
  readonly schools: readonly string[];
  readonly attributes: Attributes;
  readonly temporaryAttribute?: AttributeId;
  readonly maxHp: number;
  readonly hp: number;
  readonly maxMana: number;
  readonly mana: number;
  readonly maxStamina: number;
  readonly stamina: number;
  readonly equipment: Readonly<Record<EquipmentSlot, string | null>>;
  readonly learnedCardIds: readonly string[];
  readonly runLearnedCardIds: readonly string[];
  readonly injuries: readonly string[];
  readonly pendingLeadership: number;
  readonly downed: boolean;
  readonly deckPreview?: readonly DeckCardPreviewSnapshot[];
}

export interface BuildingState {
  readonly id: "pillarhouse" | "cinder_forge" | "quiet_house" | "wardyard" | "ember_vault" | "wayfarer";
  readonly state: "unavailable" | "available" | "built" | "damaged";
}

export interface HavenSnapshot {
  readonly id: string;
  readonly name: string;
  readonly locationId: string;
  readonly pillarCapacity: 10;
  readonly litPillars: number;
  readonly gloom: number;
  readonly resources: Readonly<Record<"salvage" | "emberglass" | "rations" | "timber" | "stone" | "wick" | "ember_shard", number>>;
  readonly buildings: readonly BuildingState[];
  readonly heroes: readonly HeroSnapshot[];
  readonly holdings: readonly ItemInstance[];
  readonly memorialAcknowledged: boolean;
}

export interface MemorialRecord {
  readonly id: string;
  readonly havenId: string;
  readonly heroNames: readonly string[];
  readonly kind: "expedition_wipe" | "haven_fall";
  readonly runId: string;
}

export interface CampaignWorldSnapshot {
  readonly campaignId: string;
  readonly currentHavenId: string;
  readonly havenSequence: number;
  readonly claimedWaypointIds: readonly string[];
  readonly settlementTraceIds: readonly string[];
  readonly blueprintIds: readonly string[];
  readonly discoveryIds: readonly string[];
  readonly memorials: readonly MemorialRecord[];
  readonly fallenHavenIds: readonly string[];
}

export type RunPhase =
  | "map"
  | "combat"
  | "reward"
  | "event"
  | "rest"
  | "craft"
  | "temporary_growth"
  | "waypoint"
  | "return_choice"
  | "return_results"
  | "wipe_results"
  | "succession";

export interface RouteNodeSnapshot {
  readonly id: string;
  readonly type: "haven" | "combat" | "event" | "rest" | "safe_craft" | "boss" | "waypoint" | "return_combat" | "return_event";
  readonly label: string;
  readonly visibility: "hidden" | "category_revealed" | "resolved";
  readonly contentId?: string;
  readonly state: "available" | "entered" | "resolved" | "locked";
}

export interface RouteEdgeSnapshot {
  readonly id: string;
  readonly from: string;
  readonly to: string;
  readonly runGloomCost: 5;
}

export interface BlockLayer {
  readonly id: string;
  readonly sourceId: string;
  readonly amount: number;
  readonly createdAtRevision: number;
  readonly expiresAtOwnerTurnStart: number;
  readonly special: "normal" | "gloom";
}

export interface TimedCondition {
  readonly id: "exposed" | "weakened" | "stun" | "strain";
  readonly expiresAfterCompletedTurn: number;
}

export interface BurnStack {
  readonly remainingOwnerTurns: number;
}

export interface GuardLink {
  readonly id: string;
  readonly guardingHeroId: string;
  readonly protectedHeroId: string;
  readonly expiresAtGuardTurnStart: number;
  readonly createdAtRevision: number;
}

export interface CombatantSnapshot {
  readonly id: string;
  readonly definitionId: string;
  readonly name: string;
  readonly side: "heroes" | "enemies";
  readonly kind: "hero" | "enemy" | "entity";
  readonly hp: number;
  readonly maxHp: number;
  readonly dex: number;
  readonly strength: number;
  readonly intellect: number;
  readonly initiative: number;
  readonly itemInitiative: number;
  readonly blockLayers: readonly BlockLayer[];
  readonly conditions: readonly TimedCondition[];
  readonly burn: readonly BurnStack[];
  readonly turnsStarted: number;
  readonly turnsCompleted: number;
  readonly downed: boolean;
  readonly destroyed: boolean;
  readonly nextDamageBonus: number;
  readonly carriedItemId?: string;
  readonly ownerId?: string;
  readonly targetable: boolean;
}

export type CardZone = "draw" | "hand" | "discard" | "exhaust" | "temporary";

export interface CardInstanceSnapshot {
  readonly cardInstanceId: string;
  readonly definitionId: string;
  readonly ownerId: string;
  readonly sourceId: string;
  readonly zone: CardZone;
  readonly retain: boolean;
  readonly exhaust: boolean;
  readonly costDelta: number;
  readonly damageDelta: number;
  readonly blockDelta: number;
  readonly selfDamage: number;
  readonly presentation: {
    readonly name: string;
    readonly apCost: number;
    readonly manaCost: number;
    readonly staminaCost: number;
    readonly targetSpec: string;
    readonly summary: string;
  };
}

export interface BasicActionSnapshot {
  readonly definitionId: string;
  readonly name: string;
  readonly apCost: number;
  readonly targetSpec: "self" | "enemy";
  readonly summary: string;
}

export interface HeroCombatResources {
  readonly heroId: string;
  readonly ap: number;
  readonly mana: number;
  readonly stamina: number;
}

export interface EnemyIntentSnapshot {
  readonly enemyId: string;
  readonly intentId: string;
  readonly label: string;
  readonly targetLabel: string;
  readonly magnitude: number;
  readonly revealedAtRevision: number;
}

export interface CombatSnapshot {
  readonly combatId: string;
  readonly encounterId: string;
  readonly round: number;
  readonly timeline: readonly string[];
  readonly timelineCursor: number;
  readonly activeCombatantId: string;
  /** True after setup until the player acknowledges Engage; no turns have resolved yet. */
  readonly awaitingEngage: boolean;
  readonly combatants: readonly CombatantSnapshot[];
  readonly heroResources: readonly HeroCombatResources[];
  readonly cards: readonly CardInstanceSnapshot[];
  readonly basicActions: readonly { readonly heroId: string; readonly attack: BasicActionSnapshot; readonly block: BasicActionSnapshot }[];
  readonly intents: readonly EnemyIntentSnapshot[];
  readonly guards: readonly GuardLink[];
  readonly supplyUsed: boolean;
  readonly retainRefillUsedHeroIds: readonly string[];
  readonly bossTurn: number;
  readonly outcome: "active" | "victory" | "wipe";
}

export interface RewardOffer {
  readonly id: string;
  readonly kind: "item" | "scroll" | "supply";
  readonly item: ItemInstance;
}

export type PendingDecisionSnapshot =
  | { readonly kind: "reward"; readonly sourceId: string; readonly offers: readonly RewardOffer[]; readonly automatic: Readonly<Record<string, number>>; readonly carrierItemId?: string }
  | { readonly kind: "event"; readonly eventId: string; readonly optionIds: readonly string[]; readonly choices: readonly DecisionChoiceSnapshot[] }
  | { readonly kind: "rest"; readonly baseGloomReduction: 12; readonly modifier: number; readonly optionIds: readonly string[]; readonly choices: readonly DecisionChoiceSnapshot[] }
  | { readonly kind: "craft"; readonly recipeIds: readonly string[]; readonly choices: readonly DecisionChoiceSnapshot[] }
  | { readonly kind: "temporary_growth"; readonly heroIds: readonly string[] }
  | { readonly kind: "waypoint"; readonly maxChestSlots: 3 }
  | { readonly kind: "return_choice"; readonly edgeIds: readonly string[] }
  | { readonly kind: "leadership"; readonly heroIds: readonly string[] };

/** Weighted chance band disclosed on Event / Craft choice cards before confirm. */
export interface DecisionOutcomeBand {
  readonly id: string;
  readonly weight: number;
  /** Player-facing label (already humanized). */
  readonly label: string;
}

export interface DecisionChoiceSnapshot {
  readonly id: string;
  readonly label: string;
  /** Flat summary for logs / legacy confirm text. Prefer effectLines + outcomeBands in UI. */
  readonly detail: string;
  /** Material / scroll / gear counts required to choose this option. */
  readonly cost?: Readonly<Record<string, number>>;
  /** Deterministic effect lines shown under OUTCOME (before any roll). */
  readonly effectLines?: readonly string[];
  /** Weighted bands shown under ODDS; empty/omitted means Guaranteed. */
  readonly outcomeBands?: readonly DecisionOutcomeBand[];
  /** Materials this option can grant (for state-strip relevance). */
  readonly grantMaterials?: Readonly<Record<string, number>>;
  /** Player must pick a living hero before the command is submitted. */
  readonly needsHeroTarget?: boolean;
  /** Player must pick an expedition equipment item before the command is submitted. */
  readonly needsItemTarget?: boolean;
  readonly riskTier?: "safe" | "risky" | "dire";
}

export interface ChronicleFacts {
  readonly runId: string;
  readonly seed: number;
  readonly heroNames: readonly string[];
  readonly visitedNodes: readonly string[];
  readonly encounters: readonly string[];
  readonly eventChoices: readonly string[];
  readonly injuries: readonly string[];
  readonly claimedWaypointIds: readonly string[];
  readonly recoveredItemNames: readonly string[];
  readonly sealedItemNames: readonly string[];
  readonly lostItemNames: readonly string[];
  readonly terminalResult: "return" | "wipe" | "succession";
}

export interface RunDiagnostics {
  readonly nodes: readonly string[];
  readonly gloomChanges: readonly { readonly source: string; readonly before: number; readonly after: number }[];
  readonly combatRounds: number;
  readonly cardsPlayed: number;
  readonly basicActions: number;
  readonly downs: number;
  readonly rewardsChosen: readonly string[];
  readonly eventChoices: readonly string[];
  readonly craftBranches: readonly string[];
  readonly shroudOutcome?: "destroyed" | "survived";
}

export interface ExpeditionRunSnapshot {
  readonly runId: string;
  readonly rootSeed: number;
  readonly phase: RunPhase;
  readonly terminalResult?: "return" | "wipe" | "succession";
  readonly runGloom: number;
  readonly routeId: "unlit_road";
  readonly currentNodeId: string;
  readonly nodes: readonly RouteNodeSnapshot[];
  readonly edges: readonly RouteEdgeSnapshot[];
  readonly visitedNodeIds: readonly string[];
  readonly heroes: readonly HeroSnapshot[];
  readonly materials: Readonly<Record<"salvage" | "emberglass" | "rations" | "timber" | "stone" | "wick" | "ember_shard", number>>;
  readonly holdings: readonly ItemInstance[];
  readonly waypointChest: readonly ItemInstance[];
  readonly flags: readonly string[];
  readonly standardCombatsWon: number;
  readonly bossDefeated: boolean;
  readonly waypointClaimed: boolean;
  readonly remotePillarRepairs: number;
  readonly combat?: CombatSnapshot;
  readonly pendingDecision?: PendingDecisionSnapshot;
  readonly chronicleFacts?: ChronicleFacts;
  readonly diagnostics: RunDiagnostics;
}

export type ViewId =
  | "haven"
  | "map"
  | "combat"
  | "reward"
  | "event"
  | "rest"
  | "craft"
  | "growth"
  | "waypoint"
  | "returnChoice"
  | "returnResults"
  | "wipeResults"
  | "succession"
  | "postReturn";

export interface GameSnapshot {
  readonly schemaVersion: typeof SNAPSHOT_SCHEMA_VERSION;
  readonly contentVersion: string;
  readonly contentHash: string;
  readonly revision: number;
  readonly rngStates: NamedRngStates;
  readonly campaign: CampaignWorldSnapshot;
  readonly haven: HavenSnapshot;
  readonly activeRun?: ExpeditionRunSnapshot;
  readonly view: ViewId;
  readonly latestFacts: readonly ResolvedFact[];
}

export interface AcceptedCommandRecord {
  readonly commandId: string;
  readonly sequence: number;
  readonly expectedRevision: number;
  readonly resultingRevision: number;
  readonly command: CommandEnvelope;
  readonly result: AcceptedCommandResult;
  readonly facts: readonly ResolvedFact[];
  readonly resolvedEventHash: string;
}

export interface RunRecord {
  readonly runId: string;
  readonly seed: number;
  readonly contentHash: string;
  readonly result: "return" | "wipe" | "succession";
  readonly diagnostics: RunDiagnostics;
  readonly chronicleFacts?: ChronicleFacts;
}
