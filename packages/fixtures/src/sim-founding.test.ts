import { describe, expect, it } from "vitest";
import { build1Pack } from "@nightfall/content";
import { applyCommand, createFoundingSnapshot, createInitialSnapshot } from "@nightfall/sim";
import { command } from "./index.js";

describe("SIM-17 founding names the Haven before the Hub", () => {
  it("rejects embark until nameHaven founds the settlement", () => {
    const founding = createFoundingSnapshot(build1Pack, 401);
    expect(founding.view).toBe("founding");
    expect(founding.haven.name).toBe("");
    expect(founding.haven.buildings.some((building) => building.id === "pillarhouse" && building.state === "built")).toBe(true);
    expect(founding.haven.heroes.map((hero) => hero.classId)).toEqual(["vanguard", "aether_weaver"]);
    const embark = applyCommand(founding, command(founding, "commitEmbark"), build1Pack);
    expect(embark.status).toBe("rejected");
    if (embark.status === "rejected") expect(embark.reasonCode).toBe("invalid_phase");
    const named = applyCommand(founding, command(founding, "nameHaven", { name: "Ashwake" }), build1Pack);
    expect(named.status).toBe("accepted");
    if (named.status !== "accepted") throw new Error("nameHaven failed");
    expect(named.snapshot.view).toBe("haven");
    expect(named.snapshot.haven.name).toBe("Ashwake");
    const renamed = applyCommand(named.snapshot, command(named.snapshot, "nameHaven", { name: "Cinder Rest" }), build1Pack);
    expect(renamed.status).toBe("accepted");
    if (renamed.status !== "accepted") throw new Error("rename failed");
    expect(renamed.snapshot.view).toBe("haven");
    expect(renamed.snapshot.haven.name).toBe("Cinder Rest");
  });

  it("keeps createInitialSnapshot as a founded Haven for existing fixtures", () => {
    const snapshot = createInitialSnapshot(build1Pack, 402, "Lantern's Rest");
    expect(snapshot.view).toBe("haven");
    expect(snapshot.haven.name).toBe("Lantern's Rest");
    const embark = applyCommand(snapshot, command(snapshot, "commitEmbark"), build1Pack);
    expect(embark.status).toBe("accepted");
  });
});
