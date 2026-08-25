import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import cookie from "@fastify/cookie";
import fastifyStatic from "@fastify/static";
import type { CommandEnvelope } from "@nightfall/contracts";
import { SESSION_COOKIE_NAME, SESSION_TTL_MS } from "@nightfall/contracts";
import { openLocalSessionHost } from "@nightfall/host";
import Fastify from "fastify";

function defaultSavePath(): string {
  const here = dirname(fileURLToPath(import.meta.url));
  return resolve(here, "..", ".nightfall", "nightfall.sqlite");
}

function adoptIfPresent(fromFile: string, canonical: string): void {
  if (!existsSync(fromFile) || fromFile === canonical) return;
  mkdirSync(dirname(canonical), { recursive: true });
  copyFileSync(fromFile, canonical);
  for (const suffix of ["-wal", "-shm"] as const) {
    if (existsSync(`${fromFile}${suffix}`)) copyFileSync(`${fromFile}${suffix}`, `${canonical}${suffix}`);
  }
}

function resolveSavePath(): string {
  if (process.env.NIGHTFALL_SAVE_PATH !== undefined && process.env.NIGHTFALL_SAVE_PATH.length > 0) {
    return resolve(process.env.NIGHTFALL_SAVE_PATH);
  }
  const canonical = defaultSavePath();
  if (!existsSync(canonical)) {
    const here = dirname(fileURLToPath(import.meta.url));
    adoptIfPresent(resolve(process.cwd(), ".nightfall", "nightfall.sqlite"), canonical);
    adoptIfPresent(resolve(here, "..", "..", "..", ".nightfall", "nightfall.sqlite"), canonical);
  }
  return canonical;
}

const portValue = Number.parseInt(process.env.NIGHTFALL_PORT ?? "3050", 10);
const port = Number.isSafeInteger(portValue) && portValue > 0 ? portValue : 3050;
const bindHost = process.env.NIGHTFALL_HOST ?? "127.0.0.1";
const savePath = resolveSavePath();
const configuredSeed = process.env.NIGHTFALL_SEED === undefined ? undefined : Number.parseInt(process.env.NIGHTFALL_SEED, 10);
const sessionHost = openLocalSessionHost({ savePath, ...(configuredSeed === undefined || !Number.isSafeInteger(configuredSeed) ? {} : { rootSeed: configuredSeed }) });
const app = Fastify({ logger: true, bodyLimit: 64 * 1024 });
await app.register(cookie);

const cookieOptions = { path: "/", httpOnly: true, sameSite: "lax" as const, maxAge: Math.floor(SESSION_TTL_MS / 1000) };

function tokenOf(request: { cookies: Record<string, string | undefined> }): string | undefined {
  const value = request.cookies[SESSION_COOKIE_NAME];
  return value === undefined || value.length === 0 ? undefined : value;
}

app.get("/api/health", async (request) => sessionHost.health(tokenOf(request)));

app.get("/api/session", async (request) => sessionHost.session(tokenOf(request)));

app.get("/api/profiles", async () => ({ profiles: sessionHost.listProfiles() }));

app.post<{ Body: { displayName?: string; pin?: string } }>("/api/profiles", async (request, reply) => {
  const result = await sessionHost.createProfile(
    typeof request.body?.displayName === "string" ? request.body.displayName : "",
    typeof request.body?.pin === "string" ? request.body.pin : undefined
  );
  if (!result.ok) return reply.code(result.status).send(result.body);
  reply.setCookie(SESSION_COOKIE_NAME, result.value.token, cookieOptions);
  return { profile: result.value.profile };
});

app.post<{ Params: { id: string }; Body: { pin?: string } }>("/api/profiles/:id/select", async (request, reply) => {
  const result = await sessionHost.selectProfile(request.params.id, typeof request.body?.pin === "string" ? request.body.pin : undefined);
  if (!result.ok) return reply.code(result.status).send(result.body);
  reply.setCookie(SESSION_COOKIE_NAME, result.value.token, cookieOptions);
  return { profile: result.value.profile };
});

app.patch<{ Params: { id: string }; Body: { displayName?: string; pin?: string; currentPin?: string } }>("/api/profiles/:id", async (request, reply) => {
  const token = tokenOf(request);
  if (token === undefined) return reply.code(401).send({ error: "unauthenticated", message: "No survivor is bound to this lantern." });
  if (typeof request.body?.displayName === "string") {
    const renamed = await sessionHost.renameProfile(token, request.params.id, request.body.displayName);
    if (!renamed.ok) return reply.code(renamed.status).send(renamed.body);
  }
  if (request.body !== null && typeof request.body === "object" && ("pin" in request.body || "currentPin" in request.body)) {
    const pinResult = await sessionHost.setPin(
      token,
      request.params.id,
      typeof request.body.currentPin === "string" ? request.body.currentPin : undefined,
      typeof request.body.pin === "string" ? request.body.pin : undefined
    );
    if (!pinResult.ok) return reply.code(pinResult.status).send(pinResult.body);
    return { profile: pinResult.value };
  }
  const session = sessionHost.session(token);
  return { profile: session.profile };
});

app.delete<{ Params: { id: string }; Body: { confirmName?: string; pin?: string } }>("/api/profiles/:id", async (request, reply) => {
  const token = tokenOf(request);
  const bound = sessionHost.session(token).profile?.profileId;
  const result = await sessionHost.deleteProfile(
    request.params.id,
    typeof request.body?.confirmName === "string" ? request.body.confirmName : "",
    typeof request.body?.pin === "string" ? request.body.pin : undefined,
    token
  );
  if (!result.ok) return reply.code(result.status).send(result.body);
  if (bound === request.params.id) reply.clearCookie(SESSION_COOKIE_NAME, { path: "/" });
  return { deleted: true };
});

app.post("/api/session/logout", async (request, reply) => {
  sessionHost.logout(tokenOf(request));
  reply.clearCookie(SESSION_COOKIE_NAME, { path: "/" });
  return { authenticated: false };
});

app.post<{ Body: { confirmReplace?: boolean } }>("/api/campaigns/new", async (request, reply) => {
  const result = await sessionHost.startNewCampaign(tokenOf(request) ?? "", request.body?.confirmReplace === true);
  if (!result.ok) return reply.code(result.status).send(result.body);
  return { profile: result.value.profile };
});

app.get("/api/snapshot", async (request, reply) => {
  reply.header("cache-control", "no-store");
  const result = await sessionHost.getSnapshot(tokenOf(request));
  if (!result.ok) return reply.code(result.status).send(result.body);
  if ("mismatch" in result.value) {
    return reply.code(409).send({
      error: result.value.mismatch.reasonCode,
      message: result.value.mismatch.reasonCode === "content_mismatch"
        ? "This Haven was saved with a different content pack. The file is still on this host."
        : "This Haven's save schema cannot be opened. The file is still on this host.",
      mismatch: result.value.mismatch,
      profile: result.value.profile
    });
  }
  return result.value.snapshot;
});

app.post<{ Body: CommandEnvelope }>("/api/commands", async (request, reply) => {
  const body = request.body;
  if (body === null || typeof body !== "object" || typeof body.commandId !== "string" || typeof body.expectedRevision !== "number" || typeof body.type !== "string" || body.payload === null || typeof body.payload !== "object") {
    return reply.code(400).send({ status: "rejected", commandId: typeof body?.commandId === "string" ? body.commandId : "invalid", reasonCode: "invalid_command" });
  }
  const result = await sessionHost.submit(tokenOf(request), body);
  if (!result.ok) return reply.code(result.status).send(result.body);
  reply.header("cache-control", "no-store");
  return reply.code(result.value.status === "accepted" ? 200 : 409).send(result.value);
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
  await sessionHost.close();
};
process.once("SIGINT", () => { void close(); });
process.once("SIGTERM", () => { void close(); });

await app.listen({ port, host: bindHost });
