import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import fastifyStatic from "@fastify/static";
import type { CommandEnvelope } from "@nightfall/contracts";
import { openDefaultLocalGameHost } from "@nightfall/host";
import Fastify from "fastify";

const portValue = Number.parseInt(process.env.NIGHTFALL_PORT ?? "3050", 10);
const port = Number.isSafeInteger(portValue) && portValue > 0 ? portValue : 3050;
const bindHost = process.env.NIGHTFALL_HOST ?? "127.0.0.1";
const savePath = resolve(process.env.NIGHTFALL_SAVE_PATH ?? join(process.cwd(), ".nightfall", "nightfall.sqlite"));
const configuredSeed = process.env.NIGHTFALL_SEED === undefined ? undefined : Number.parseInt(process.env.NIGHTFALL_SEED, 10);
const gameHost = await openDefaultLocalGameHost({ savePath, ...(configuredSeed === undefined || !Number.isSafeInteger(configuredSeed) ? {} : { rootSeed: configuredSeed }) });
const app = Fastify({ logger: true, bodyLimit: 64 * 1024 });

app.get("/api/health", async () => {
  const snapshot = await gameHost.getSnapshot();
  return { status: "ok", revision: snapshot.revision, schemaVersion: snapshot.schemaVersion, contentVersion: snapshot.contentVersion, contentHash: snapshot.contentHash };
});

app.get("/api/snapshot", async (_request, reply) => {
  reply.header("cache-control", "no-store");
  return gameHost.getSnapshot();
});

app.post<{ Body: CommandEnvelope }>("/api/commands", async (request, reply) => {
  const body = request.body;
  if (body === null || typeof body !== "object" || typeof body.commandId !== "string" || typeof body.expectedRevision !== "number" || typeof body.type !== "string" || body.payload === null || typeof body.payload !== "object") {
    return reply.code(400).send({ status: "rejected", commandId: typeof body?.commandId === "string" ? body.commandId : "invalid", reasonCode: "invalid_command" });
  }
  const result = await gameHost.submit(body);
  reply.header("cache-control", "no-store");
  return reply.code(result.status === "accepted" ? 200 : 409).send(result);
});

const clientRoot = resolve(process.cwd(), "packages", "client", "dist");
if (existsSync(clientRoot)) {
  await app.register(fastifyStatic, { root: clientRoot, wildcard: false });
  app.setNotFoundHandler((request, reply) => request.url.startsWith("/api/") ? reply.code(404).send({ error: "not_found" }) : reply.sendFile("index.html"));
} else {
  app.get("/", async () => ({ name: "Nightfall local host", status: "client_not_built", hint: "Run pnpm build before pnpm start." }));
}

const close = async () => {
  await app.close();
  await gameHost.close();
};
process.once("SIGINT", () => { void close(); });
process.once("SIGTERM", () => { void close(); });

await app.listen({ port, host: bindHost });
