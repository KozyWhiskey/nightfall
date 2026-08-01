import { useEffect, useRef, useState } from "react";
import type { CombatSnapshot, EnemyIntentSnapshot } from "@nightfall/contracts";
import { enemiesActedBetween, playbackIntentFor } from "./combatUi.js";

const ENEMY_ACTION_MS = 920;
const TRACKER_STEP_MS = 380;

export type TurnPlaybackState = {
  readonly busy: boolean;
  readonly actingCombatantId: string | null;
  readonly actingIntent: EnemyIntentSnapshot | undefined;
  readonly trackerFocusId: string | null;
};

const idle: TurnPlaybackState = {
  busy: false,
  actingCombatantId: null,
  actingIntent: undefined,
  trackerFocusId: null
};

export function useTurnPlayback(
  combat: CombatSnapshot,
  revision: number
): TurnPlaybackState {
  const previousRef = useRef<{ revision: number; combat: CombatSnapshot } | null>(null);
  const [state, setState] = useState<TurnPlaybackState>(idle);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (timerRef.current !== null) {
      globalThis.clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    const previous = previousRef.current;
    previousRef.current = { revision, combat };

    if (previous === null) {
      setState(idle);
      return;
    }

    if (previous.revision === revision) {
      return;
    }

    const queue = enemiesActedBetween(previous.combat, combat);
    if (queue.length === 0) {
      setState(idle);
      return;
    }

    let step = 0;
    setState({
      busy: true,
      actingCombatantId: queue[0] ?? null,
      actingIntent: playbackIntentFor(queue[0] ?? "", previous.combat.intents),
      trackerFocusId: queue[0] ?? null
    });

    const advance = () => {
      step += 1;
      if (step >= queue.length) {
        setState(idle);
        return;
      }
      const id = queue[step]!;
      setState({
        busy: true,
        actingCombatantId: id,
        actingIntent: playbackIntentFor(id, previous.combat.intents),
        trackerFocusId: id
      });
      timerRef.current = globalThis.setTimeout(advance, ENEMY_ACTION_MS);
    };

    timerRef.current = globalThis.setTimeout(advance, ENEMY_ACTION_MS);

    return () => {
      if (timerRef.current !== null) globalThis.clearTimeout(timerRef.current);
    };
  }, [revision, combat]);

  return state;
}

export { ENEMY_ACTION_MS, TRACKER_STEP_MS };
