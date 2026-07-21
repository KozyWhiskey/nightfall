export * from "./schema.js";
export * from "./validation.js";
export { rawBuild1Pack } from "./pack.js";

import { rawBuild1Pack } from "./pack.js";
import { validateContentPack } from "./validation.js";

export const build1Pack = validateContentPack(rawBuild1Pack);
