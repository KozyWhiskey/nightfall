import type { CommandEnvelope, CommandResult, GameHost, GameSnapshot, SnapshotListener, Unsubscribe } from "@nightfall/contracts";

export class HttpGameHost implements GameHost {
  readonly #listeners = new Set<SnapshotListener>();

  public async getSnapshot(): Promise<GameSnapshot> {
    const response = await fetch("/api/snapshot", { headers: { accept: "application/json" }, cache: "no-store" });
    if (!response.ok) throw new Error(`Snapshot request failed (${response.status})`);
    return response.json() as Promise<GameSnapshot>;
  }

  public async submit(command: CommandEnvelope): Promise<CommandResult> {
    const response = await fetch("/api/commands", { method: "POST", headers: { "content-type": "application/json", accept: "application/json" }, body: JSON.stringify(command) });
    const result = await response.json() as CommandResult;
    if (result.status === "accepted") for (const listener of this.#listeners) listener(result.snapshot);
    return result;
  }

  public subscribe(listener: SnapshotListener): Unsubscribe {
    this.#listeners.add(listener);
    return () => this.#listeners.delete(listener);
  }
}
