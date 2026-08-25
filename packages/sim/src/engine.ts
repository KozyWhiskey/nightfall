import type { AcceptedCommandResult, CommandEnvelope, CommandResult, GameSnapshot, ReasonCode } from "@nightfall/contracts";
import type { ValidatedContentPack } from "@nightfall/content";
import { hashResolvedFacts } from "./facts.js";
import { cloneSnapshot, createContext, emitFact, type ForcedStreams, type MutableSnapshot, type SimulationContext } from "./internal.js";
import { assignTemporaryStat, buildingCommand, cancelCraft, chooseCraft, chooseEvent, chooseMapEdge, chooseRest, chooseReward, combatCommand, commitEmbark, continueAfterTerminal, leaveReward, preparationCommand, waypointCommand, wipe } from "./expedition.js";

function reject(command: CommandEnvelope, revision: number, reasonCode: ReasonCode): CommandResult {
  return { status: "rejected", commandId: command.commandId, reasonCode, revision };
}

function assertExclusiveOwnership(snapshot: MutableSnapshot): void {
  const items = [
    ...snapshot.haven.holdings,
    ...(snapshot.activeRun?.holdings ?? []),
    ...(snapshot.activeRun?.waypointChest ?? [])
  ];
  const seen = new Set<string>();
  for (const item of items) {
    if (seen.has(item.instanceId)) throw new Error(`Item ${item.instanceId} occupies more than one location`);
    seen.add(item.instanceId);
  }
}

function dispatch(snapshot: MutableSnapshot, command: CommandEnvelope, pack: ValidatedContentPack, context: SimulationContext): ReasonCode | undefined {
  if (command.type === "nameHaven") {
    if (snapshot.activeRun !== undefined || snapshot.view !== "haven") return "invalid_phase";
    const name = typeof command.payload.name === "string" ? command.payload.name.trim() : "";
    if (name.length < 2 || name.length > 40) return "invalid_command";
    snapshot.haven.name = name;
    emitFact(context, snapshot.revision, "haven_named", `The Haven is now named ${name}.`, { name });
    return undefined;
  }
  if (command.type === "commitEmbark") return commitEmbark(snapshot, pack, context);
  if (command.type === "chooseMapEdge") return chooseMapEdge(snapshot, pack, command, context);
  if (["engageCombat", "playCard", "useBasicAttack", "useBasicBlock", "useSupply", "endTurn"].includes(command.type)) return combatCommand(snapshot, pack, command, context);
  if (command.type === "chooseReward") return chooseReward(snapshot, command, context);
  if (command.type === "leaveReward") return leaveReward(snapshot, context);
  if (command.type === "chooseEventOption") return chooseEvent(snapshot, pack, command, context);
  if (command.type === "chooseRestOption") return chooseRest(snapshot, command, context);
  if (command.type === "chooseCraftRecipe") return chooseCraft(snapshot, pack, command, context);
  if (command.type === "cancelCraft") return cancelCraft(snapshot, context);
  if (command.type === "assignTemporaryStat") return assignTemporaryStat(snapshot, pack, command, context);
  if (["spendEmberShardRite", "sealChestItem", "chooseReturnEdge"].includes(command.type)) return waypointCommand(snapshot, pack, command, context);
  if (["equipItem", "unequipItem", "learnScroll"].includes(command.type)) return preparationCommand(snapshot, pack, command, context);
  if (["assignLeadership", "buildBuilding", "repairPillar"].includes(command.type)) return buildingCommand(snapshot, pack, command, context);
  if (command.type === "continueToHaven") return continueAfterTerminal(snapshot);
  if (command.type === "abandonExpedition") {
    if (snapshot.activeRun === undefined || snapshot.activeRun.terminalResult !== undefined) return "invalid_phase";
    wipe(snapshot, pack, context); return undefined;
  }
  return "invalid_command";
}

export function applyCommand(snapshot: GameSnapshot, command: CommandEnvelope, pack: ValidatedContentPack, forcedStreams?: ForcedStreams): CommandResult {
  if (snapshot.contentVersion !== pack.contentVersion || snapshot.contentHash !== pack.contentHash) return reject(command, snapshot.revision, "content_mismatch");
  if (command.expectedRevision !== snapshot.revision) return reject(command, snapshot.revision, "stale_revision");
  const next = cloneSnapshot(snapshot); const context = createContext(forcedStreams);
  const reason = dispatch(next, command, pack, context);
  if (reason !== undefined) return reject(command, snapshot.revision, reason);
  assertExclusiveOwnership(next);
  next.revision = snapshot.revision + 1;
  next.latestFacts = context.facts;
  const facts = context.facts;
  const result: AcceptedCommandResult = {
    status: "accepted",
    commandId: command.commandId,
    revision: next.revision,
    snapshot: next,
    facts,
    resolvedEventHash: hashResolvedFacts(facts)
  };
  return result;
}
