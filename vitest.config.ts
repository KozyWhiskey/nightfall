import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const root = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@nightfall/contracts": `${root}packages/contracts/src/index.ts`,
      "@nightfall/content": `${root}packages/content/src/index.ts`,
      "@nightfall/sim": `${root}packages/sim/src/index.ts`,
      "@nightfall/persistence": `${root}packages/persistence/src/index.ts`,
      "@nightfall/host": `${root}packages/host/src/index.ts`,
      "@nightfall/fixtures": `${root}packages/fixtures/src/index.ts`
    }
  },
  test: {
    environment: "node",
    include: ["packages/**/*.test.ts", "apps/**/*.test.ts"],
    reporters: ["default"]
  }
});
