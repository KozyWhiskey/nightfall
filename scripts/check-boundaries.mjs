import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";

const violations = [];

async function sourceFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    return entry.isFile() && /\.[cm]?[tj]sx?$/.test(entry.name) ? [path] : [];
  }));
  return nested.flat();
}

const simForbidden = [
  ["Math.random", /Math\.random\s*\(/],
  ["clock access", /\b(?:Date|performance)\s*\./],
  ["network access", /\bfetch\s*\(/],
  ["browser global", /\b(?:window|document)\b/],
  ["runtime boundary import", /from\s+["'](?:react|fastify|better-sqlite3|drizzle-orm|node:(?:fs|net|http)|@nightfall\/(?:host|persistence|client))/]
];

for (const path of await sourceFiles("packages/sim/src")) {
  const source = await readFile(path, "utf8");
  for (const [label, pattern] of simForbidden) {
    if (pattern.test(source)) violations.push(`${path}: forbidden ${label}`);
  }
}

for (const path of await sourceFiles("packages/client/src")) {
  const source = await readFile(path, "utf8");
  if (/from\s+["']@nightfall\/(?:sim|host|persistence)/.test(source)) {
    violations.push(`${path}: client crosses the snapshot/command boundary`);
  }
}

if (violations.length > 0) {
  process.stderr.write(`${violations.join("\n")}\n`);
  process.exitCode = 1;
} else {
  process.stdout.write("Dependency boundaries verified.\n");
}
